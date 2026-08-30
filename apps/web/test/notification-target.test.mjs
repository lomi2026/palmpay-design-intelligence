import assert from 'node:assert/strict';
import test from 'node:test';

import { notificationTarget } from '../src/app/workspace/notifications/notification-target.ts';

const relatedReview = { id: 'review-1', content: { id: 'content-1' } };

test('review task notifications open the review center', () => {
  for (const type of ['review_submitted', 'review_assigned']) {
    assert.equal(notificationTarget({ type, relatedReview }), '/workspace/reviews');
  }
});

test('change requests open the related content editor and approvals open submissions', () => {
  assert.equal(
    notificationTarget({ type: 'review_changes_requested', relatedReview }),
    '/workspace/submit/content-1',
  );
  assert.equal(notificationTarget({ type: 'review_approved', relatedReview }), '/workspace/submissions');
});

test('unknown notifications remain non-navigable and missing change targets fall back safely', () => {
  assert.equal(notificationTarget({ type: 'integration_notification', relatedReview: null }), null);
  assert.equal(
    notificationTarget({ type: 'review_changes_requested', relatedReview: null }),
    '/workspace/submissions',
  );
});
