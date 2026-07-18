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
const reviewerEmail = `codex-reviewer-${runId}@example.test`;
const managerEmail = `codex-manager-${runId}@example.test`;
let prisma;
let server;
let organization;
let adminUser;
let memberUser;
let reviewerUser;
let managerUser;
let team;
let publishedContent;
let memberDraftContent;
let memberRestrictedContent;
let adminRestrictedContent;
let organizationContent;
let publishedAttachmentFileId;
let restrictedAttachmentFileId;
let filterCategoryId;
const contentIds = [];
const categoryIds = [];
const tagIds = [];
let serverOutput = '';

const completeAssetBody = (blocks = []) => ({
  assetType: 'COMPONENT_STANDARD',
  platforms: ['Web'],
  scenarios: ['Integration validation'],
  unsuitableScenarios: ['Unreviewed production release'],
  problemStatement: 'Integration fixture keeps the content contract complete.',
  usageGuide: 'Review the asset before applying it to a handoff.',
  resourceLinks: ['https://example.test/integration-asset'],
  blocks,
});

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
  const [adminRole, memberRole, reviewerRole, managerRole] = await Promise.all([
    prisma.role.findUniqueOrThrow({ where: { code: 'admin' } }),
    prisma.role.findUniqueOrThrow({ where: { code: 'member' } }),
    prisma.role.findUniqueOrThrow({ where: { code: 'reviewer' } }),
    prisma.role.findUniqueOrThrow({ where: { code: 'manager' } }),
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
  reviewerUser = await prisma.user.create({
    data: {
      organizationId: organization.id,
      name: 'Integration Reviewer',
      email: reviewerEmail,
      status: 'ACTIVE',
      userRoles: {
        create: {
          roleId: reviewerRole.id,
          scopeType: 'ORGANIZATION',
          scopeId: organization.id,
        },
      },
    },
  });
  managerUser = await prisma.user.create({
    data: {
      organizationId: organization.id,
      name: 'Integration Manager',
      email: managerEmail,
      status: 'ACTIVE',
      userRoles: {
        create: {
          roleId: managerRole.id,
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
    where: { id: { in: [adminUser.id, memberUser.id, reviewerUser.id, managerUser.id] } },
    data: { primaryTeamId: team.id },
  });

  async function createAsset(slug, visibility, status = 'PUBLISHED', ownerId = memberUser.id) {
    const content = await prisma.content.create({
      data: {
        organizationId: organization.id,
        contentType: 'DESIGN_ASSET',
        title: `Integration ${visibility}`,
        slug,
        summary: 'Integration catalog fixture',
        ownerId,
        teamId: team.id,
        createdById: ownerId,
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
        body: completeAssetBody(),
        createdById: ownerId,
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
  organizationContent = await createAsset(`integration-organization-${runId}`, 'ORGANIZATION');
  await createAsset(`integration-team-${runId}`, 'TEAM');
  memberRestrictedContent = await createAsset(`integration-restricted-${runId}`, 'RESTRICTED');
  adminRestrictedContent = await createAsset(
    `integration-admin-restricted-${runId}`,
    'RESTRICTED',
    'PUBLISHED',
    adminUser.id,
  );
  memberDraftContent = await createAsset(`integration-draft-${runId}`, 'ORGANIZATION', 'DRAFT');
  const filterCategory = await prisma.category.create({
    data: {
      organizationId: organization.id,
      name: `Integration filter ${runId}`,
      code: `filter-${runId}`,
      contentTypes: ['DESIGN_ASSET'],
    },
  });
  const filterTag = await prisma.tag.create({
    data: {
      organizationId: organization.id,
      name: `Integration filter tag ${runId}`,
      normalizedName: `integration-filter-${runId}`,
    },
  });
  categoryIds.push(filterCategory.id);
  filterCategoryId = filterCategory.id;
  tagIds.push(filterTag.id);
  await prisma.content.update({
    where: { id: organizationContent.id },
    data: { categoryId: filterCategory.id, verificationStatus: 'VERIFIED' },
  });
  await prisma.contentTag.create({
    data: { contentId: organizationContent.id, tagId: filterTag.id, createdById: memberUser.id },
  });
  const [publishedVersion, restrictedVersion] = await Promise.all([
    prisma.content.findUniqueOrThrow({ where: { id: publishedContent.id }, select: { currentVersionId: true } }),
    prisma.content.findUniqueOrThrow({ where: { id: adminRestrictedContent.id }, select: { currentVersionId: true } }),
  ]);
  const [publishedFile, restrictedFile] = await Promise.all([
    prisma.fileAttachment.create({
      data: {
        organizationId: organization.id,
        originalName: 'integration-published.txt',
        storageKey: `integration/${runId}/published.txt`,
        mimeType: 'text/plain',
        sizeBytes: 12,
        checksum: 'sha256:integration',
        accessLevel: 'RESTRICTED',
        uploadStatus: 'READY',
        uploadedById: adminUser.id,
      },
    }),
    prisma.fileAttachment.create({
      data: {
        organizationId: organization.id,
        originalName: 'integration-restricted.txt',
        storageKey: `integration/${runId}/restricted.txt`,
        mimeType: 'text/plain',
        sizeBytes: 12,
        checksum: 'sha256:integration',
        accessLevel: 'RESTRICTED',
        uploadStatus: 'READY',
        uploadedById: adminUser.id,
      },
    }),
  ]);
  publishedAttachmentFileId = publishedFile.id;
  restrictedAttachmentFileId = restrictedFile.id;
  await prisma.attachmentRelation.createMany({
    data: [
      { fileId: publishedFile.id, entityType: 'VERSION', entityId: publishedVersion.currentVersionId, usageType: 'ATTACHMENT' },
      { fileId: restrictedFile.id, entityType: 'VERSION', entityId: restrictedVersion.currentVersionId, usageType: 'ATTACHMENT' },
    ],
  });

  server = spawn(process.execPath, ['dist/main.js'], {
    cwd: new URL('../', import.meta.url),
    env: {
      ...process.env,
      DATABASE_URL: connectionString,
      AUTH_MODE: 'development',
      AUTH_AUTO_PROVISION: 'false',
      NODE_ENV: 'test',
      PORT: String(port),
      WEB_ORIGIN: 'http://localhost:3000',
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
  await prisma.favorite.deleteMany({
    where: {
      OR: [{ contentId: { in: contentIds } }, { userId: { in: [adminUser.id, memberUser.id] } }],
    },
  });
  await prisma.recentView.deleteMany({
    where: {
      OR: [{ contentId: { in: contentIds } }, { userId: { in: [adminUser.id, memberUser.id] } }],
    },
  });
  await prisma.usageEvent.deleteMany({
    where: {
      OR: [{ contentId: { in: contentIds } }, { userId: { in: [adminUser.id, memberUser.id] } }],
    },
  });
  await prisma.searchLog.deleteMany({
    where: {
      OR: [
        { clickedContentId: { in: contentIds } },
        { userId: { in: [adminUser.id, memberUser.id] } },
      ],
    },
  });
  await prisma.attachmentRelation.deleteMany({
    where: { fileId: { in: [publishedAttachmentFileId, restrictedAttachmentFileId].filter(Boolean) } },
  });
  await prisma.fileAttachment.deleteMany({
    where: { id: { in: [publishedAttachmentFileId, restrictedAttachmentFileId].filter(Boolean) } },
  });
  await prisma.content.deleteMany({ where: { id: { in: contentIds } } });
  if (tagIds.length) await prisma.tag.deleteMany({ where: { id: { in: tagIds } } });
  if (categoryIds.length) await prisma.category.deleteMany({ where: { id: { in: categoryIds } } });
  if (team) await prisma.team.delete({ where: { id: team.id } });
  await prisma.notification.deleteMany({
    where: { receiverId: { in: [adminUser.id, memberUser.id, reviewerUser.id, managerUser.id] } },
  });
  await prisma.user.deleteMany({
    where: { email: { in: [adminEmail, memberEmail, reviewerEmail, managerEmail] } },
  });
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

    const filters = new URLSearchParams({
      type: 'DESIGN_ASSET',
      categoryId: filterCategoryId,
      tag: `integration-filter-${runId}`,
      verificationStatus: 'VERIFIED',
    });
    const filteredCatalog = await fetch(`${baseUrl}/contents?${filters}`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(filteredCatalog.status, 200);
    const filteredFixtures = (await filteredCatalog.json()).items.filter((item) => contentIds.includes(item.id));
    assert.deepEqual(filteredFixtures.map((item) => item.id), [organizationContent.id]);
  },
);

test(
  'published attachments are listed and downloadable only through authorized signed URLs',
  { skip: !integrationEnabled },
  async () => {
    const detail = await fetch(`${baseUrl}/contents/${publishedContent.slug}`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(detail.status, 200);
    assert.equal((await detail.json()).attachments.some((item) => item.file.id === publishedAttachmentFileId), true);

    const allowedDownload = await fetch(`${baseUrl}/files/${publishedAttachmentFileId}/download`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(allowedDownload.status, 200);
    assert.equal(typeof (await allowedDownload.json()).url, 'string');

    const blockedDownload = await fetch(`${baseUrl}/files/${restrictedAttachmentFileId}/download`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(blockedDownload.status, 403);
  },
);

test(
  'draft preview source is visible only to its author or content editors',
  { skip: !integrationEnabled },
  async () => {
    const authorView = await fetch(`${baseUrl}/content-drafts/${memberDraftContent.id}`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(authorView.status, 200);
    const authorDraft = await authorView.json();
    assert.equal(authorDraft.draftVersion.versionStatus, 'DRAFT');
    assert.equal(authorDraft.draftVersion.body.assetType, 'COMPONENT_STANDARD');

    const reviewerView = await fetch(`${baseUrl}/content-drafts/${memberDraftContent.id}`, {
      headers: { 'x-dev-user-email': reviewerEmail },
    });
    assert.equal(reviewerView.status, 403);

    const editorView = await fetch(`${baseUrl}/content-drafts/${memberDraftContent.id}`, {
      headers: { 'x-dev-user-email': adminEmail },
    });
    assert.equal(editorView.status, 200);
  },
);

test(
  'search, favorites, recent views and usage confirmation persist formal engagement data',
  { skip: !integrationEnabled },
  async () => {
    const project = await prisma.content.create({
      data: {
        organizationId: organization.id,
        contentType: 'AI_PROJECT',
        title: 'Integration reuse project',
        slug: `integration-project-${runId}`,
        ownerId: memberUser.id,
        teamId: team.id,
        createdById: memberUser.id,
        status: 'PUBLISHED',
        visibility: 'ORGANIZATION',
        publishedAt: new Date(),
        projectDetail: { create: { projectCode: `IT-${runId}` } },
      },
    });
    const projectVersion = await prisma.contentVersion.create({
      data: {
        contentId: project.id,
        versionNumber: 1,
        versionStatus: 'PUBLISHED',
        title: project.title,
        body: {},
        createdById: memberUser.id,
        publishedAt: new Date(),
      },
    });
    await prisma.content.update({
      where: { id: project.id },
      data: { currentVersionId: projectVersion.id },
    });
    contentIds.push(project.id);

    const search = await fetch(`${baseUrl}/search?q=Integration&pageSize=100`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(search.status, 200);
    const searchBody = await search.json();
    assert.equal(
      searchBody.items.some((item) => item.id === publishedContent.id),
      true,
    );
    assert.equal(
      searchBody.items.some((item) => item.id === memberRestrictedContent.id),
      true,
    );
    assert.equal(
      searchBody.items.some((item) => item.id === adminRestrictedContent.id),
      false,
    );
    const click = await fetch(`${baseUrl}/search/${searchBody.searchLogId}/click`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': memberEmail },
      body: JSON.stringify({ contentId: publishedContent.id }),
    });
    assert.equal(click.status, 200);
    const searchLog = await prisma.searchLog.findUniqueOrThrow({
      where: { id: searchBody.searchLogId },
    });
    assert.equal(searchLog.clickedContentId, publishedContent.id);

    const favorite = await fetch(`${baseUrl}/contents/${publishedContent.id}/favorite`, {
      method: 'POST',
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(favorite.status, 201);
    const favorites = await fetch(`${baseUrl}/me/favorites`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(favorites.status, 200);
    assert.equal(
      (await favorites.json()).items.some((item) => item.content.id === publishedContent.id),
      true,
    );

    const detail = await fetch(`${baseUrl}/contents/${publishedContent.slug}`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(detail.status, 200);
    const recent = await fetch(`${baseUrl}/me/recent-views`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(recent.status, 200);
    assert.equal(
      (await recent.json()).items.some((item) => item.content.id === publishedContent.id),
      true,
    );

    const usage = await fetch(`${baseUrl}/contents/${publishedContent.id}/usage-confirmations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': memberEmail },
      body: JSON.stringify({ projectContentId: project.id, note: 'Integration reuse evidence.' }),
    });
    assert.equal(usage.status, 201);
    const usageSummary = await fetch(`${baseUrl}/contents/${publishedContent.id}/usage-summary`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(usageSummary.status, 200);
    assert.equal((await usageSummary.json()).usageCount, 1);
  },
);

test(
  'event, analytics and administration APIs retain RBAC and organization boundaries',
  { skip: !integrationEnabled },
  async () => {
    const rejectedEvent = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': memberEmail },
      body: JSON.stringify({ eventType: 'content_share', contentId: adminRestrictedContent.id }),
    });
    assert.equal(rejectedEvent.status, 404);

    const recordedEvent = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': memberEmail },
      body: JSON.stringify({
        eventType: 'content_share',
        contentId: publishedContent.id,
        sourcePage: `/workspace/design-assets/${publishedContent.slug}`,
      }),
    });
    assert.equal(recordedEvent.status, 201);
    const shareEvent = await prisma.usageEvent.findFirstOrThrow({
      where: {
        userId: memberUser.id,
        contentId: publishedContent.id,
        eventType: 'content_share',
      },
      orderBy: { occurredAt: 'desc' },
    });
    assert.deepEqual(shareEvent.metadata, {
      sourcePage: `/workspace/design-assets/${publishedContent.slug}`,
    });

    const memberOverview = await fetch(`${baseUrl}/analytics/overview`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(memberOverview.status, 403);

    for (const path of ['/analytics/overview', '/analytics/insights']) {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: { 'x-dev-user-email': managerEmail },
      });
      assert.equal(response.status, 200, `Expected manager access to ${path}`);
    }
    for (const path of ['/reviews/queue', '/admin/contents?pageSize=20']) {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: { 'x-dev-user-email': managerEmail },
      });
      assert.equal(response.status, 403, `Expected manager denial for ${path}`);
    }

    for (const path of [
      '/analytics/overview',
      '/analytics/insights',
      '/admin/contents?pageSize=20',
      '/admin/categories',
      '/admin/tags',
      '/admin/audit-logs?pageSize=20',
    ]) {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: { 'x-dev-user-email': adminEmail },
      });
      assert.equal(response.status, 200, `Expected admin access to ${path}`);
    }
  },
);

test(
  'a contributor can revise and resubmit after an independent reviewer requests changes',
  { skip: !integrationEnabled },
  async () => {
    const submit = await fetch(`${baseUrl}/reviews/content/${memberDraftContent.id}/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': memberEmail },
      body: JSON.stringify({ message: 'Please review the first draft.' }),
    });
    assert.equal(submit.status, 201);
    const firstReview = await prisma.reviewRequest.findFirstOrThrow({
      where: { contentId: memberDraftContent.id, status: 'PENDING' },
    });

    const assign = await fetch(`${baseUrl}/reviews/${firstReview.id}/assign`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': adminEmail },
      body: JSON.stringify({ reviewerId: reviewerUser.id }),
    });
    assert.equal(assign.status, 200);
    const requestChanges = await fetch(`${baseUrl}/reviews/${firstReview.id}/request-changes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': reviewerEmail },
      body: JSON.stringify({ comment: 'Please add a concrete usage guide.' }),
    });
    assert.equal(requestChanges.status, 201);

    const afterRequestChanges = await prisma.content.findUniqueOrThrow({
      where: { id: memberDraftContent.id },
      include: { draftVersion: true },
    });
    assert.equal(afterRequestChanges.status, 'CHANGES_REQUESTED');
    assert.equal(afterRequestChanges.draftVersion.versionStatus, 'CHANGES_REQUESTED');

    const revise = await fetch(`${baseUrl}/content-drafts/${memberDraftContent.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': memberEmail },
      body: JSON.stringify({
        title: 'Revised integration draft',
        changeSummary: 'Added the requested usage guide.',
        body: completeAssetBody(),
      }),
    });
    assert.equal(revise.status, 200);
    const resubmit = await fetch(`${baseUrl}/reviews/content/${memberDraftContent.id}/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': memberEmail },
      body: JSON.stringify({ message: 'Updated according to the reviewer feedback.' }),
    });
    assert.equal(resubmit.status, 201);

    const reviews = await prisma.reviewRequest.findMany({
      where: { contentId: memberDraftContent.id },
      orderBy: { createdAt: 'asc' },
    });
    assert.equal(reviews.length, 2);
    assert.equal(reviews[0].status, 'CHANGES_REQUESTED');
    assert.equal(reviews[1].status, 'PENDING');

    const reassign = await fetch(`${baseUrl}/reviews/${reviews[1].id}/assign`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': adminEmail },
      body: JSON.stringify({ reviewerId: reviewerUser.id }),
    });
    assert.equal(reassign.status, 200);
    const approve = await fetch(`${baseUrl}/reviews/${reviews[1].id}/approve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': reviewerEmail },
      body: JSON.stringify({ comment: 'Revision is complete and approved.' }),
    });
    assert.equal(approve.status, 201);
    const publish = await fetch(`${baseUrl}/content-drafts/${memberDraftContent.id}/publish`, {
      method: 'POST',
      headers: { 'x-dev-user-email': adminEmail },
    });
    assert.equal(publish.status, 201);

    const published = await prisma.content.findUniqueOrThrow({
      where: { id: memberDraftContent.id },
      include: { currentVersion: true },
    });
    assert.equal(published.status, 'PUBLISHED');
    assert.equal(published.draftVersionId, null);
    assert.equal(published.currentVersion.title, 'Revised integration draft');
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
    const createDraft = await fetch(
      `${baseUrl}/content-drafts/${publishedContent.id}/from-published`,
      {
        method: 'POST',
        headers: { 'x-dev-user-email': memberEmail },
      },
    );
    assert.equal(createDraft.status, 201);
    const draftContent = await createDraft.json();
    assert.equal(draftContent.status, 'PUBLISHED');
    assert.equal(draftContent.currentVersionId, original.currentVersionId);
    assert.equal(draftContent.draftVersion.versionNumber, 2);
    assert.equal(draftContent.draftVersion.baseVersionId, original.currentVersionId);
    assert.deepEqual(draftContent.draftVersion.body, original.currentVersion.body);

    const memberContributions = await fetch(`${baseUrl}/content-drafts`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(memberContributions.status, 200);
    const memberContributionData = await memberContributions.json();
    assert.equal(memberContributionData.items.some((item) => item.id === publishedContent.id), true);
    assert.equal(memberContributionData.total, memberContributionData.items.length);

    const adminContributions = await fetch(`${baseUrl}/content-drafts`, {
      headers: { 'x-dev-user-email': adminEmail },
    });
    assert.equal(adminContributions.status, 200);
    const adminContributionData = await adminContributions.json();
    assert.equal(adminContributionData.items.some((item) => item.id === publishedContent.id), false);

    const autosave = await fetch(`${baseUrl}/content-drafts/${publishedContent.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': memberEmail },
      body: JSON.stringify({ title: 'Edited draft title', body: completeAssetBody(['new draft only']) }),
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
    assert.deepEqual(afterAutosave.draftVersion.body, completeAssetBody(['new draft only']));

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

    const review = await prisma.reviewRequest.findFirstOrThrow({
      where: { versionId: afterSubmit.draftVersionId },
    });
    const assign = await fetch(`${baseUrl}/reviews/${review.id}/assign`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': adminEmail },
      body: JSON.stringify({ reviewerId: reviewerUser.id }),
    });
    assert.equal(assign.status, 200);
    const comment = await fetch(`${baseUrl}/reviews/${review.id}/comment`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': reviewerEmail },
      body: JSON.stringify({ comment: 'Internal reviewer note.' }),
    });
    assert.equal(comment.status, 201);
    const submissions = await fetch(`${baseUrl}/reviews/mine`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(submissions.status, 200);
    const submissionItems = (await submissions.json()).items;
    assert.equal(
      submissionItems.some((item) => item.id === review.id),
      true,
    );
    assert.equal(
      submissionItems
        .find((item) => item.id === review.id)
        .actions.some((item) => item.action === 'COMMENT'),
      true,
    );
    const reviewerNotifications = await fetch(`${baseUrl}/notifications`, {
      headers: { 'x-dev-user-email': reviewerEmail },
    });
    assert.equal(reviewerNotifications.status, 200);
    const reviewerNotificationItems = (await reviewerNotifications.json()).items;
    assert.equal(
      reviewerNotificationItems.some(
        (item) => item.relatedEntityId === review.id && item.type === 'review_submitted',
      ),
      true,
    );
    const diffResponse = await fetch(`${baseUrl}/reviews/${review.id}/diff`, {
      headers: { 'x-dev-user-email': reviewerEmail },
    });
    assert.equal(diffResponse.status, 200);
    const diff = await diffResponse.json();
    assert.equal(diff.baseVersion.versionNumber, 1);
    assert.equal(diff.version.versionNumber, 2);
    assert.deepEqual(
      diff.changes.find((change) => change.path === 'title'),
      {
        path: 'title',
        before: original.title,
        after: 'Edited draft title',
      },
    );
    assert.deepEqual(
      diff.changes.find((change) => change.path === 'body.blocks'),
      {
        path: 'body.blocks',
        before: [],
        after: ['new draft only'],
      },
    );
    const memberDiff = await fetch(`${baseUrl}/reviews/${review.id}/diff`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(memberDiff.status, 403);
    const approve = await fetch(`${baseUrl}/reviews/${review.id}/approve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': reviewerEmail },
      body: JSON.stringify({ comment: 'Approved integration version.' }),
    });
    assert.equal(approve.status, 201);
    const submitterNotifications = await fetch(`${baseUrl}/notifications`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(submitterNotifications.status, 200);
    const submitterNotificationItems = (await submitterNotifications.json()).items;
    assert.equal(
      submitterNotificationItems.some(
        (item) => item.relatedEntityId === review.id && item.type === 'review_approved',
      ),
      true,
    );

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

    const memberUnpublish = await fetch(
      `${baseUrl}/content-drafts/${publishedContent.id}/unpublish`,
      {
        method: 'POST',
        headers: { 'x-dev-user-email': memberEmail },
      },
    );
    assert.equal(memberUnpublish.status, 403);
    const unpublish = await fetch(`${baseUrl}/content-drafts/${publishedContent.id}/unpublish`, {
      method: 'POST',
      headers: { 'x-dev-user-email': adminEmail },
    });
    assert.equal(unpublish.status, 201);
    assert.equal(
      (await prisma.content.findUniqueOrThrow({ where: { id: publishedContent.id } })).status,
      'UNPUBLISHED',
    );
    const archive = await fetch(`${baseUrl}/content-drafts/${publishedContent.id}/archive`, {
      method: 'POST',
      headers: { 'x-dev-user-email': adminEmail },
    });
    assert.equal(archive.status, 201);
    const archived = await prisma.content.findUniqueOrThrow({ where: { id: publishedContent.id } });
    assert.equal(archived.status, 'ARCHIVED');
    assert.equal(archived.archivedAt instanceof Date, true);
  },
);

test(
  'taxonomy administration records create and status changes in the audit log',
  { skip: !integrationEnabled },
  async () => {
    const categoryCode = `integration-category-${runId}`;
    const created = await fetch(`${baseUrl}/admin/categories`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': adminEmail },
      body: JSON.stringify({
        name: 'Integration Category',
        code: categoryCode,
        contentTypes: ['DESIGN_ASSET'],
      }),
    });
    assert.equal(created.status, 201);
    const category = await created.json();
    categoryIds.push(category.id);

    const updated = await fetch(`${baseUrl}/admin/categories/${category.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': adminEmail },
      body: JSON.stringify({ status: 'DISABLED' }),
    });
    assert.equal(updated.status, 200);
    assert.equal((await updated.json()).status, 'DISABLED');

    const auditEntries = await prisma.auditLog.findMany({
      where: { organizationId: organization.id, entityType: 'category', entityId: category.id },
      select: { action: true, actorId: true },
      orderBy: { createdAt: 'asc' },
    });
    assert.deepEqual(
      auditEntries.map((entry) => entry.action),
      ['taxonomy.category.create', 'taxonomy.category.update'],
    );
    assert.equal(auditEntries.every((entry) => entry.actorId === adminUser.id), true);
  },
);

test(
  'notifications are private and support individual and bulk read acknowledgement',
  { skip: !integrationEnabled },
  async () => {
    const [memberNotification, adminNotification] = await Promise.all([
      prisma.notification.create({
        data: {
          receiverId: memberUser.id,
          type: 'integration_notification',
          title: 'Member integration notification',
          message: 'This notification belongs to the integration member.',
        },
      }),
      prisma.notification.create({
        data: {
          receiverId: adminUser.id,
          type: 'integration_notification',
          title: 'Admin integration notification',
          message: 'This notification belongs to the integration admin.',
        },
      }),
    ]);

    const memberNotifications = await fetch(`${baseUrl}/notifications`, {
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(memberNotifications.status, 200);
    const memberList = await memberNotifications.json();
    assert.equal(memberList.items.some((item) => item.id === memberNotification.id), true);
    assert.equal(memberList.items.some((item) => item.id === adminNotification.id), false);

    const markOwnRead = await fetch(`${baseUrl}/notifications/${memberNotification.id}/read`, {
      method: 'PATCH',
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(markOwnRead.status, 200);
    assert.equal(
      (await prisma.notification.findUniqueOrThrow({ where: { id: memberNotification.id } })).readAt instanceof Date,
      true,
    );

    const markForeignRead = await fetch(`${baseUrl}/notifications/${adminNotification.id}/read`, {
      method: 'PATCH',
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(markForeignRead.status, 403);

    const bulkRead = await fetch(`${baseUrl}/notifications/read-all`, {
      method: 'PATCH',
      headers: { 'x-dev-user-email': memberEmail },
    });
    assert.equal(bulkRead.status, 200);
    assert.equal(
      await prisma.notification.count({ where: { receiverId: memberUser.id, readAt: null } }),
      0,
    );
  },
);

test(
  'request validation, CORS and search input preserve security boundaries',
  { skip: !integrationEnabled },
  async () => {
    const crossOriginPreflight = await fetch(`${baseUrl}/content-drafts`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://attacker.example',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,x-dev-user-email',
      },
    });
    assert.notEqual(crossOriginPreflight.headers.get('access-control-allow-origin'), 'https://attacker.example');

    const massAssignment = await fetch(`${baseUrl}/content-drafts`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': memberEmail },
      body: JSON.stringify({
        contentType: 'DESIGN_ASSET',
        title: 'Rejected mass assignment',
        teamId: team.id,
        body: {},
        ownerId: adminUser.id,
      }),
    });
    assert.equal(massAssignment.status, 400);

    const spoofedFile = await fetch(`${baseUrl}/files/upload-intents`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-dev-user-email': memberEmail },
      body: JSON.stringify({
        originalName: 'unsafe.svg',
        mimeType: 'image/svg+xml',
        sizeBytes: 48,
        checksumSha256: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
      }),
    });
    assert.equal(spoofedFile.status, 400);

    const injectionLikeSearch = await fetch(
      `${baseUrl}/search?q=${encodeURIComponent("' OR 1=1 --")}&pageSize=100`,
      { headers: { 'x-dev-user-email': memberEmail } },
    );
    assert.equal(injectionLikeSearch.status, 200);
    const searchResults = await injectionLikeSearch.json();
    assert.equal(searchResults.items.some((item) => item.id === adminRestrictedContent.id), false);
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
