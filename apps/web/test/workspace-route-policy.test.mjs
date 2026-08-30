import assert from 'node:assert/strict';
import test from 'node:test';

import {
  filterWorkspaceWarmRoutes,
  shouldPrefetchWorkspaceRoute,
} from '../src/components/workspace/workspace-route-policy.ts';

test('recent views bypass default link prefetch while other workspace routes stay fast', () => {
  assert.equal(shouldPrefetchWorkspaceRoute('/workspace/recent'), false);
  assert.equal(shouldPrefetchWorkspaceRoute('/workspace/recent?source=nav'), false);
  assert.equal(shouldPrefetchWorkspaceRoute('/workspace/ai-skills'), true);
});

test('background route warming excludes recent views only', () => {
  assert.deepEqual(
    filterWorkspaceWarmRoutes([
      '/workspace',
      '/workspace/recent',
      '/workspace/notifications',
    ]),
    ['/workspace', '/workspace/notifications'],
  );
});
