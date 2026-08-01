import assert from 'node:assert/strict';
import test from 'node:test';

import { reviewCardPermissions } from '../src/app/workspace/reviews/review-permissions.ts';

test('reviewers can process an assigned pending review only from the mine filter', () => {
  assert.deepEqual(
    reviewCardPermissions({
      assignedReviewerId: 'reviewer-1',
      canAssign: false,
      currentUserId: 'reviewer-1',
      filter: 'mine',
      status: 'PENDING',
    }),
    { canAssign: false, canProcess: true },
  );

  assert.deepEqual(
    reviewCardPermissions({
      assignedReviewerId: 'reviewer-1',
      canAssign: false,
      currentUserId: 'reviewer-1',
      filter: 'pending',
      status: 'PENDING',
    }),
    { canAssign: false, canProcess: false },
  );
});

test('only administrators with review assignment permission can assign from the pending filter', () => {
  assert.deepEqual(
    reviewCardPermissions({
      assignedReviewerId: null,
      canAssign: true,
      currentUserId: 'admin-1',
      filter: 'pending',
      status: 'PENDING',
    }),
    { canAssign: true, canProcess: false },
  );

  assert.deepEqual(
    reviewCardPermissions({
      assignedReviewerId: null,
      canAssign: false,
      currentUserId: 'reviewer-1',
      filter: 'pending',
      status: 'PENDING',
    }),
    { canAssign: false, canProcess: false },
  );
});
