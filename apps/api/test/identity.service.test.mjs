import assert from 'node:assert/strict';
import test from 'node:test';
import { IdentityService } from '../dist/identity/identity.service.js';

function serviceFixture({ existingStatus = 'ACTIVE', ownedContent = [], replacementOwner = null } = {}) {
  const calls = { updates: [], ownershipUpdates: [], audits: [] };
  const existing = {
    id: 'user-1',
    organizationId: 'organization-1',
    name: 'Content owner',
    status: existingStatus,
  };
  const prisma = {
    user: {
      findFirst: async ({ where } = {}) => where?.id === 'replacement-1' ? replacementOwner : existing,
      update: async ({ data }) => {
        calls.updates.push(data);
        return { ...existing, ...data };
      },
    },
    content: {
      findMany: async () => ownedContent,
      updateMany: async ({ data }) => {
        calls.ownershipUpdates.push(data);
        return { count: ownedContent.length };
      },
    },
    auditLog: {
      create: async ({ data }) => {
        calls.audits.push(data);
        return data;
      },
    },
  };
  prisma.$transaction = async (operation) => operation(prisma);
  const audit = {
    write: async (entry) => {
      calls.audits.push(entry);
    },
  };
  return { service: new IdentityService(prisma, audit), calls };
}

test('disabling a content owner is blocked until ownership is transferred', async () => {
  const ownedContent = [
    { id: 'content-1', title: 'Owned asset', slug: 'owned-asset', status: 'PUBLISHED' },
  ];
  const { service, calls } = serviceFixture({ ownedContent });

  await assert.rejects(
    service.updateUserStatus(
      'organization-1',
      'user-1',
      { status: 'DISABLED' },
      'admin-1',
    ),
    (error) => {
      assert.equal(error.getStatus(), 409);
      assert.deepEqual(error.getResponse(), {
        code: 'CONTENT_OWNERSHIP_TRANSFER_REQUIRED',
        message: 'Select an active replacement owner before disabling this user.',
        ownedContentCount: 1,
        ownedContent,
      });
      return true;
    },
  );
  assert.deepEqual(calls.updates, []);
  assert.deepEqual(calls.ownershipUpdates, []);
  assert.deepEqual(calls.audits, []);
});

test('disabling a content owner transfers ownership in the same transaction', async () => {
  const ownedContent = [
    { id: 'content-1', title: 'Owned asset', slug: 'owned-asset', status: 'PUBLISHED' },
  ];
  const { service, calls } = serviceFixture({
    ownedContent,
    replacementOwner: {
      id: 'replacement-1',
      primaryTeamId: 'team-1',
      userRoles: [
        {
          scopeType: 'ORGANIZATION',
          scopeId: 'organization-1',
          role: {
            rolePermissions: [{ permission: { code: 'content.edit_own' } }],
          },
        },
      ],
    },
  });

  const updated = await service.updateUserStatus(
    'organization-1',
    'user-1',
    { status: 'DISABLED', replacementOwnerId: 'replacement-1' },
    'admin-1',
  );

  assert.equal(updated.status, 'DISABLED');
  assert.deepEqual(calls.ownershipUpdates, [{ ownerId: 'replacement-1' }]);
  assert.equal(calls.audits[0].action, 'content.owner.transfer');
  assert.equal(calls.audits[1].action, 'user.disable');
});

test('disabling a user without owned content writes the required audit event', async () => {
  const { service, calls } = serviceFixture();

  const updated = await service.updateUserStatus(
    'organization-1',
    'user-1',
    { status: 'DISABLED' },
    'admin-1',
  );

  assert.equal(updated.status, 'DISABLED');
  assert.deepEqual(calls.updates, [{ status: 'DISABLED' }]);
  assert.equal(calls.audits.length, 1);
  assert.equal(calls.audits[0].action, 'user.disable');
  assert.equal(calls.audits[0].entityId, 'user-1');
});

test('changing a non-disable status does not require ownership transfer', async () => {
  const { service, calls } = serviceFixture({
    existingStatus: 'INVITED',
    ownedContent: [{ id: 'content-1' }],
  });

  const updated = await service.updateUserStatus(
    'organization-1',
    'user-1',
    { status: 'ACTIVE' },
    'admin-1',
  );

  assert.equal(updated.status, 'ACTIVE');
  assert.equal(calls.audits[0].action, 'user.status.update');
});
