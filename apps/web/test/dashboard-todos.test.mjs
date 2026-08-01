import assert from 'node:assert/strict';
import test from 'node:test';

import { buildDashboardTodos } from '../src/app/workspace/(dashboard)/dashboard-todos.ts';

const content = { id: 'content-1', title: 'Content title', contentType: 'AI_SKILL' };
const version = { title: 'Version title' };

test('contributor todos include only change requests and link directly to the editor', () => {
  const todos = buildDashboardTodos({
    userId: 'member-1',
    canSubmit: true,
    canReview: false,
    canAssign: false,
    submissions: [
      { id: 'pending', status: 'PENDING', submittedAt: '2026-08-01T00:00:00Z', content, version },
      { id: 'changes', status: 'CHANGES_REQUESTED', submittedAt: '2026-08-02T00:00:00Z', content, version },
    ],
    reviewQueue: [],
  });

  assert.deepEqual(todos.map(({ id, href, label }) => ({ id, href, label })), [
    { id: 'changes', href: '/workspace/submit/content-1', label: '按意见修改' },
  ]);
});

test('reviewers see assigned pending work and administrators see unassigned pending work', () => {
  const todos = buildDashboardTodos({
    userId: 'reviewer-1',
    canSubmit: false,
    canReview: true,
    canAssign: true,
    submissions: [],
    reviewQueue: [
      { id: 'mine', status: 'PENDING', submittedAt: '2026-08-03T00:00:00Z', content, version, assignedReviewer: { id: 'reviewer-1' } },
      { id: 'other', status: 'PENDING', submittedAt: '2026-08-04T00:00:00Z', content, version, assignedReviewer: { id: 'reviewer-2' } },
      { id: 'unassigned', status: 'PENDING', submittedAt: '2026-08-05T00:00:00Z', content, version, assignedReviewer: null },
      { id: 'handled', status: 'APPROVED', submittedAt: '2026-08-06T00:00:00Z', content, version, assignedReviewer: { id: 'reviewer-1' } },
    ],
  });

  assert.deepEqual(todos.map(({ id, href, label }) => ({ id, href, label })), [
    { id: 'mine', href: '/workspace/reviews', label: '待我审核' },
    { id: 'unassigned', href: '/workspace/reviews', label: '待分配' },
  ]);
});

test('multi-role todos are stable, deduplicated and limited', () => {
  const duplicated = {
    id: 'review-1',
    status: 'PENDING',
    submittedAt: '2026-08-01T00:00:00Z',
    content,
    version,
    assignedReviewer: { id: 'user-1' },
  };
  const todos = buildDashboardTodos({
    userId: 'user-1',
    canSubmit: false,
    canReview: true,
    canAssign: true,
    submissions: [],
    reviewQueue: [duplicated, duplicated],
    limit: 1,
  });

  assert.equal(todos.length, 1);
  assert.equal(todos[0].id, 'review-1');
});
