import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { after, before, test } from 'node:test';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../dist/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;
const integrationEnabled = Boolean(connectionString);
const port = 31987;
const baseUrl = `http://127.0.0.1:${port}/api`;
const runId = `${process.pid}-${Date.now()}`;
const adminEmail = `codex-admin-${runId}@example.test`;
const memberEmail = `codex-member-${runId}@example.test`;
let prisma;
let server;
let organization;
let adminUser;
let memberUser;
let team;
const contentIds = [];
let serverOutput = '';

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // The child process is still starting.
    }
    await delay(100);
  }
  throw new Error(`API server did not become ready for integration tests.\n${serverOutput}`);
}

before(async () => {
  if (!integrationEnabled) return;

  prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  organization = await prisma.organization.findUniqueOrThrow({
    where: { code: 'palmpay-experience-design' },
  });
  const [adminRole, memberRole] = await Promise.all([
    prisma.role.findUniqueOrThrow({ where: { code: 'admin' } }),
    prisma.role.findUniqueOrThrow({ where: { code: 'member' } }),
  ]);
  adminUser = await prisma.user.create({
    data: {
      organizationId: organization.id,
      name: 'Integration Admin',
      email: adminEmail,
      status: 'ACTIVE',
      userRoles: {
        create: {
          roleId: adminRole.id,
          scopeType: 'ORGANIZATION',
          scopeId: organization.id,
        },
      },
    },
  });
  memberUser = await prisma.user.create({
    data: {
      organizationId: organization.id,
      name: 'Integration Member',
      email: memberEmail,
      status: 'ACTIVE',
      userRoles: {
        create: {
          roleId: memberRole.id,
          scopeType: 'ORGANIZATION',
          scopeId: organization.id,
        },
      },
    },
  });
  team = await prisma.team.create({
    data: {
      organizationId: organization.id,
      name: 'Integration Team',
      code: `integration-${runId}`,
      ownerId: adminUser.id,
    },
  });
  await prisma.user.updateMany({
    where: { id: { in: [adminUser.id, memberUser.id] } },
    data: { primaryTeamId: team.id },
  });

  async function createAsset(slug, visibility, status = 'PUBLISHED') {
    const content = await prisma.content.create({
      data: {
        organizationId: organization.id,
        contentType: 'DESIGN_ASSET',
        title: `Integration ${visibility}`,
        slug,
        summary: 'Integration catalog fixture',
        ownerId: memberUser.id,
        teamId: team.id,
        createdById: memberUser.id,
        status,
        visibility,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        assetDetail: { create: { assetType: 'COMPONENT_STANDARD', platforms: ['Web'] } },
      },
    });
    const version = await prisma.contentVersion.create({
      data: {
        contentId: content.id,
        versionNumber: 1,
        versionLabel: 'v1.0',
        versionStatus: status,
        title: content.title,
        summary: content.summary,
        body: { blocks: [] },
        createdById: memberUser.id,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
    });
    if (status === 'PUBLISHED') {
      await prisma.content.update({
        where: { id: content.id },
        data: { currentVersionId: version.id },
      });
    } else {
      await prisma.content.update({
        where: { id: content.id },
        data: { draftVersionId: version.id },
      });
    }
    contentIds.push(content.id);
    return content;
  }

  await createAsset(`integration-public-${runId}`, 'PUBLIC');
  await createAsset(`integration-organization-${runId}`, 'ORGANIZATION');
  await createAsset(`integration-team-${runId}`, 'TEAM');
  await createAsset(`integration-restricted-${runId}`, 'RESTRICTED');
  await createAsset(`integration-draft-${runId}`, 'ORGANIZATION', 'DRAFT');

  server = spawn(process.execPath, ['dist/main.js'], {
    cwd: new URL('../', import.meta.url),
    env: {
      ...process.env,
      DATABASE_URL: connectionString,
      AUTH_MODE: 'development',
      AUTH_AUTO_PROVISION: 'false',
      NODE_ENV: 'test',
      PORT: String(port),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });
  await waitForServer();
});

after(async () => {
  if (!integrationEnabled) return;
  server?.kill('SIGTERM');
  await prisma.content.deleteMany({ where: { id: { in: contentIds } } });
  if (team) await prisma.team.delete({ where: { id: team.id } });
  await prisma.user.deleteMany({ where: { email: { in: [adminEmail, memberEmail] } } });
  await prisma.$disconnect();
});

test(
  'content catalog filters published records by visibility and identity',
  { skip: !integrationEnabled },
  async () => {
    await prisma.user.update({ where: { id: memberUser.id }, data: { status: 'ACTIVE' } });
    const publicCatalog = await fetch(`${baseUrl}/contents?pageSize=100`);
    assert.equal(publicCatalog.status, 200);
    const publicBody = await publicCatalog.json();
    const publicFixtures = publicBody.items.filter((item) => contentIds.includes(item.id));
    assert.deepEqual(
      publicFixtures.map((item) => item.visibility),
      ['PUBLIC'],
    );

    const memberCatalog = await fetch(`${baseUrl}/contents?pageSize=100`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(memberCatalog.status, 200);
    const memberBody = await memberCatalog.json();
    const memberFixtures = memberBody.items.filter((item) => contentIds.includes(item.id));
    assert.equal(memberFixtures.length, 4);
    assert.equal(
      memberFixtures.some((item) => item.status !== 'PUBLISHED'),
      false,
    );

    const organizationSlug = `integration-organization-${runId}`;
    const publicOrganizationDetail = await fetch(`${baseUrl}/contents/${organizationSlug}`);
    assert.equal(publicOrganizationDetail.status, 404);

    const memberOrganizationDetail = await fetch(`${baseUrl}/contents/${organizationSlug}`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(memberOrganizationDetail.status, 200);
    const detail = await memberOrganizationDetail.json();
    assert.equal(detail.currentVersion.versionNumber, 1);
    assert.equal(detail.assetDetail.assetType, 'COMPONENT_STANDARD');
  },
);

test(
  'identity API enforces authentication, RBAC, tenant scope and disabled-user access',
  { skip: !integrationEnabled },
  async () => {
    const unauthenticated = await fetch(`${baseUrl}/me`);
    assert.equal(unauthenticated.status, 401);

    const adminMe = await fetch(`${baseUrl}/me`, { headers: { 'x-dev-user-email': adminEmail } });
    assert.equal(adminMe.status, 200);
    const admin = await adminMe.json();
    assert.equal(admin.id, adminUser.id);
    assert.equal(admin.permissions.includes('user.manage'), true);

    const memberAdminRequest = await fetch(`${baseUrl}/organizations/${organization.id}/users`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(memberAdminRequest.status, 403);

    const adminUsersRequest = await fetch(`${baseUrl}/organizations/${organization.id}/users`, {
      headers: { 'x-dev-user-email': adminEmail },
    });
    assert.equal(adminUsersRequest.status, 200);
    const users = await adminUsersRequest.json();
    assert.equal(
      users.items.some((user) => user.id === memberUser.id),
      true,
    );

    const crossOrganizationRequest = await fetch(
      `${baseUrl}/organizations/00000000-0000-0000-0000-000000000000/users`,
      {
        headers: { 'x-dev-user-email': adminEmail },
      },
    );
    assert.equal(crossOrganizationRequest.status, 403);

    await prisma.user.update({ where: { id: memberUser.id }, data: { status: 'DISABLED' } });
    const disabledUserRequest = await fetch(`${baseUrl}/me`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(disabledUserRequest.status, 403);
  },
);
