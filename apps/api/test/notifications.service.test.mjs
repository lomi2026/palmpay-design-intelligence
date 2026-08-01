import assert from 'node:assert/strict';
import test from 'node:test';

import { NotificationsService } from '../dist/notifications/notifications.service.js';

const user = { id: 'user-1', organizationId: 'organization-1' };

test('notification listing returns the full private unread count and related review content', async () => {
  const calls = { notificationWhere: null, countWhere: null, reviewWhere: null };
  const prisma = {
    notification: {
      findMany: async ({ where }) => {
        calls.notificationWhere = where;
        return [{
          id: 'notification-1',
          receiverId: user.id,
          type: 'review_changes_requested',
          relatedEntityType: 'review_request',
          relatedEntityId: 'review-1',
          readAt: null,
        }];
      },
      count: async ({ where }) => {
        calls.countWhere = where;
        return 101;
      },
    },
    reviewRequest: {
      findMany: async ({ where }) => {
        calls.reviewWhere = where;
        return [{
          id: 'review-1',
          status: 'CHANGES_REQUESTED',
          content: {
            id: 'content-1',
            slug: 'content-1',
            contentType: 'AI_SKILL',
            status: 'CHANGES_REQUESTED',
          },
        }];
      },
    },
  };

  const result = await new NotificationsService(prisma).list(user);

  assert.deepEqual(calls.notificationWhere, { receiverId: user.id });
  assert.deepEqual(calls.countWhere, { receiverId: user.id, readAt: null });
  assert.deepEqual(calls.reviewWhere, {
    id: { in: ['review-1'] },
    content: { organizationId: user.organizationId, deletedAt: null },
  });
  assert.equal(result.unreadCount, 101);
  assert.equal(result.items[0].relatedReview.content.id, 'content-1');
});

test('the lightweight unread endpoint scopes its count to the authenticated receiver', async () => {
  let countWhere;
  const service = new NotificationsService({
    notification: {
      count: async ({ where }) => {
        countWhere = where;
        return 3;
      },
    },
  });

  assert.deepEqual(await service.unreadCount(user), { unreadCount: 3 });
  assert.deepEqual(countWhere, { receiverId: user.id, readAt: null });
});
