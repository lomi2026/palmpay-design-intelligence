import assert from 'node:assert/strict';
import test from 'node:test';
import { DevelopmentAuthAdapter } from '../dist/auth/development-auth.adapter.js';
import { TestAuthAdapter } from '../dist/auth/test-auth.adapter.js';

const accessCode = 'test-access-code-with-at-least-24-characters';
const sessionSecret = 'test-session-secret-with-at-least-32-characters';

function adapterWith(values) {
  return new TestAuthAdapter({
    get(key) {
      return values[key];
    },
  });
}

test('test authentication signs a short-lived bearer session and rejects forged input', () => {
  const adapter = adapterWith({
    AUTH_MODE: 'test',
    TEST_AUTH_ACCESS_CODE: accessCode,
    TEST_AUTH_SESSION_SECRET: sessionSecret,
    TEST_AUTH_SESSION_TTL_SECONDS: '300',
  });

  const session = adapter.issueSession({ email: ' Test.User@Example.Test ', accessCode });
  const identity = adapter.authenticate({
    headers: { authorization: `Bearer ${session.accessToken}` },
  });

  assert.equal(identity.email, 'test.user@example.test');
  assert.throws(
    () => adapter.issueSession({ email: 'test.user@example.test', accessCode: 'incorrect-code' }),
    { message: 'The test access code is invalid.' },
  );
  assert.throws(
    () => adapter.authenticate({ headers: { authorization: 'Bearer v1.forged.signature' } }),
    { message: 'The test session is invalid.' },
  );
  assert.throws(
    () => adapter.authenticate({ headers: { authorization: `Bearer ${session.accessToken}.extra` } }),
    { message: 'The test session is invalid.' },
  );
});

test('test mode can construct the unused development adapter in production without enabling it', () => {
  const adapter = new DevelopmentAuthAdapter({
    get(key) {
      return key === 'NODE_ENV' ? 'production' : undefined;
    },
  });

  assert.throws(
    () => adapter.authenticate({ headers: { 'x-dev-user-email': 'forged@example.test' } }),
    { message: 'The development authentication adapter cannot run in production. Configure an enterprise OIDC adapter.' },
  );
});
