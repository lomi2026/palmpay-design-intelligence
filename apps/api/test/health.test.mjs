import assert from 'node:assert/strict';
import test from 'node:test';
import { HealthController } from '../dist/health/health.controller.js';

test('health endpoint reports a healthy service', () => {
  assert.deepEqual(new HealthController().getHealth(), { status: 'ok' });
});
