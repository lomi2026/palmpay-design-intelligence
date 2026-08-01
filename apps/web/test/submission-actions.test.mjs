import assert from 'node:assert/strict';
import test from 'node:test';

import { submissionRevisionHref } from '../src/app/workspace/submissions/submission-actions.ts';

test('a change-requested submission links an authorized contributor to its editor', () => {
  assert.equal(
    submissionRevisionHref(
      { status: 'CHANGES_REQUESTED', content: { id: 'content-1' } },
      true,
    ),
    '/workspace/submit/content-1',
  );
});

test('other statuses and contributors without edit permission do not expose an edit action', () => {
  assert.equal(
    submissionRevisionHref({ status: 'PENDING', content: { id: 'content-1' } }, true),
    null,
  );
  assert.equal(
    submissionRevisionHref(
      { status: 'CHANGES_REQUESTED', content: { id: 'content-1' } },
      false,
    ),
    null,
  );
});
