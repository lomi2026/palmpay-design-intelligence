import assert from 'node:assert/strict';
import test from 'node:test';
import { ReviewsService } from '../dist/reviews/reviews.service.js';

const organizationId = 'organization-1';

function reviewer(scopeType, scopeId) {
  return {
    id: `reviewer-${scopeType.toLowerCase()}`,
    organizationId,
    primaryTeamId: scopeType === 'TEAM' ? scopeId : 'team-1',
    permissions: ['review.process'],
    permissionScopes: [{ code: 'review.process', scopeType, scopeId }],
  };
}

function serviceFixture({ review = null } = {}) {
  const calls = { queueWhere: null };
  const prisma = {
    reviewRequest: {
      findMany: async ({ where }) => {
        calls.queueWhere = where;
        return [];
      },
      findFirst: async () => review,
    },
  };
  return {
    service: new ReviewsService(prisma, { write: async () => {} }, { recordEvent: async () => {} }),
    calls,
  };
}

test('team-scoped review queues are restricted to the assigned content team', async () => {
  const { service, calls } = serviceFixture();

  await service.queue(reviewer('TEAM', 'team-1'));

  assert.deepEqual(calls.queueWhere, {
    content: {
      organizationId,
      deletedAt: null,
      teamId: { in: ['team-1'] },
    },
  });
});

test('organization-scoped review queues retain organization-wide access', async () => {
  const { service, calls } = serviceFixture();

  await service.queue(reviewer('ORGANIZATION', organizationId));

  assert.deepEqual(calls.queueWhere, {
    content: {
      organizationId,
      deletedAt: null,
    },
  });
});

test('team-scoped reviewers cannot read a review diff from another content team', async () => {
  const { service } = serviceFixture({
    review: {
      id: 'review-2',
      content: { teamId: 'team-2' },
      version: { id: 'version-2', baseVersion: null },
    },
  });

  await assert.rejects(
    service.diff(reviewer('TEAM', 'team-1'), 'review-2'),
    (error) => error.getStatus() === 403,
  );
});
