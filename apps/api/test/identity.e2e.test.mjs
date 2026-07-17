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
let publishedContent;
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

  publishedContent = await createAsset(`integration-public-${runId}`, 'PUBLIC');
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
  await prisma.notification.deleteMany({ where: { receiverId: { in: [adminUser.id, memberUser.id] } } });
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
  'editing published content creates an immutable next draft version',
  { skip: !integrationEnabled },
  async () => {
    const original = await prisma.content.findUniqueOrThrow({
      where: { id: publishedContent.id },
      include: { currentVersion: true },
    });
    const createDraft = await fetch(`${baseUrl}/content-drafts/${publishedContent.id}/from-published`, {
      method: 'POST',
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(createDraft.status, 201);
    const draftContent = await createDraft.json();
    assert.equal(draftContent.status, 'PUBLISHED');
    assert.equal(draftContent.currentVersionId, original.currentVersionId);
    assert.equal(draftContent.draftVersion.versionNumber, 2);
    assert.equal(draftContent.draftVersion.baseVersionId, original.currentVersionId);
    assert.deepEqual(draftContent.draftVersion.body, original.currentVersion.body);

    const autosave = await fetch(`${baseUrl}/content-drafts/${publishedContent.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': memberEmail },
      body: JSON.stringify({ title: 'Edited draft title', body: { blocks: ['new draft only'] } }),
    });
    assert.equal(autosave.status, 200);

    const afterAutosave = await prisma.content.findUniqueOrThrow({
      where: { id: publishedContent.id },
      include: { currentVersion: true, draftVersion: true },
    });
    assert.equal(afterAutosave.status, 'PUBLISHED');
    assert.equal(afterAutosave.title, original.title);
    assert.equal(afterAutosave.currentVersion.title, original.currentVersion.title);
    assert.equal(afterAutosave.draftVersion.title, 'Edited draft title');
    assert.deepEqual(afterAutosave.draftVersion.body, { blocks: ['new draft only'] });

    const submit = await fetch(`${baseUrl}/reviews/content/${publishedContent.id}/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': memberEmail },
      body: JSON.stringify({ message: 'Please review v2.' }),
    });
    assert.equal(submit.status, 201);
    const afterSubmit = await prisma.content.findUniqueOrThrow({
      where: { id: publishedContent.id },
      include: { currentVersion: true, draftVersion: true },
    });
    assert.equal(afterSubmit.status, 'PUBLISHED');
    assert.equal(afterSubmit.currentVersionId, original.currentVersionId);
    assert.equal(afterSubmit.draftVersion.versionStatus, 'IN_REVIEW');

    const review = await prisma.reviewRequest.findFirstOrThrow({ where: { versionId: afterSubmit.draftVersionId } });
    const assign = await fetch(`${baseUrl}/reviews/${review.id}/assign`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': adminEmail },
      body: JSON.stringify({ reviewerId: adminUser.id }),
    });
    assert.equal(assign.status, 200);
    const comment = await fetch(`${baseUrl}/reviews/${review.id}/comment`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': adminEmail },
      body: JSON.stringify({ comment: 'Internal reviewer note.' }),
    });
    assert.equal(comment.status, 201);
    const submissions = await fetch(`${baseUrl}/reviews/mine`, { headers: { 'x-dev-user-email': memberEmail } });
    assert.equal(submissions.status, 200);
    const submissionItems = (await submissions.json()).items;
    assert.equal(submissionItems.some((item) => item.id === review.id), true);
    assert.equal(submissionItems.find((item) => item.id === review.id).actions.some((item) => item.action === 'COMMENT'), true);
    const reviewerNotifications = await fetch(`${baseUrl}/notifications`, { headers: { 'x-dev-user-email': adminEmail } });
    assert.equal(reviewerNotifications.status, 200);
    const reviewerNotificationItems = (await reviewerNotifications.json()).items;
    assert.equal(reviewerNotificationItems.some((item) => item.relatedEntityId === review.id && item.type === 'review_submitted'), true);
    const diffResponse = await fetch(`${baseUrl}/reviews/${review.id}/diff`, {
      headers: { 'x-dev-user-email': adminEmail },
    });
    assert.equal(diffResponse.status, 200);
    const diff = await diffResponse.json();
    assert.equal(diff.baseVersion.versionNumber, 1);
    assert.equal(diff.version.versionNumber, 2);
    assert.deepEqual(diff.changes.find((change) => change.path === 'title'), {
      path: 'title', before: original.title, after: 'Edited draft title',
    });
    assert.deepEqual(diff.changes.find((change) => change.path === 'body.blocks'), {
      path: 'body.blocks', before: [], after: ['new draft only'],
    });
    const memberDiff = await fetch(`${baseUrl}/reviews/${review.id}/diff`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(memberDiff.status, 403);
    const approve = await fetch(`${baseUrl}/reviews/${review.id}/approve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': adminEmail },
      body: JSON.stringify({ comment: 'Approved integration version.' }),
    });
    assert.equal(approve.status, 201);
    const submitterNotifications = await fetch(`${baseUrl}/notifications`, { headers: { 'x-dev-user-email': memberEmail } });
    assert.equal(submitterNotifications.status, 200);
    const submitterNotificationItems = (await submitterNotifications.json()).items;
    assert.equal(submitterNotificationItems.some((item) => item.relatedEntityId === review.id && item.type === 'review_approved'), true);

    const memberPublish = await fetch(`${baseUrl}/content-drafts/${publishedContent.id}/publish`, {
      method: 'POST',
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(memberPublish.status, 403);
    const publish = await fetch(`${baseUrl}/content-drafts/${publishedContent.id}/publish`, {
      method: 'POST',
      headers: { 'x-dev-user-email': adminEmail },
    });
    assert.equal(publish.status, 201);

    const afterPublish = await prisma.content.findUniqueOrThrow({
      where: { id: publishedContent.id },
      include: { currentVersion: true, versions: { orderBy: { versionNumber: 'asc' } } },
    });
    assert.equal(afterPublish.status, 'PUBLISHED');
    assert.equal(afterPublish.draftVersionId, null);
    assert.equal(afterPublish.currentVersion.versionNumber, 2);
    assert.equal(afterPublish.currentVersion.title, 'Edited draft title');
    assert.equal(afterPublish.title, 'Edited draft title');
    assert.equal(afterPublish.versions[0].versionStatus, 'PUBLISHED');
    assert.equal(afterPublish.versions[1].versionStatus, 'PUBLISHED');
    assert.equal(afterPublish.versions[1].publishedAt instanceof Date, true);

    const memberUnpublish = await fetch(`${baseUrl}/content-drafts/${publishedContent.id}/unpublish`, {
      method: 'POST', headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(memberUnpublish.status, 403);
    const unpublish = await fetch(`${baseUrl}/content-drafts/${publishedContent.id}/unpublish`, {
      method: 'POST', headers: { 'x-dev-user-email': adminEmail },
    });
    assert.equal(unpublish.status, 201);
    assert.equal((await prisma.content.findUniqueOrThrow({ where: { id: publishedContent.id } })).status, 'UNPUBLISHED');
    const archive = await fetch(`${baseUrl}/content-drafts/${publishedContent.id}/archive`, {
      method: 'POST', headers: { 'x-dev-user-email': adminEmail },
    });
    assert.equal(archive.status, 201);
    const archived = await prisma.content.findUniqueOrThrow({ where: { id: publishedContent.id } });
    assert.equal(archived.status, 'ARCHIVED');
    assert.equal(archived.archivedAt instanceof Date, true);
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
