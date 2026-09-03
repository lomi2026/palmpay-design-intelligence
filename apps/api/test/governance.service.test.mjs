import assert from 'node:assert/strict';
import test from 'node:test';

import { GovernanceService } from '../dist/governance/governance.service.js';

const user = { id: 'admin-1', organizationId: 'organization-1' };

function fixture(existingTag = null) {
  const calls = { creates: [], updates: [], audits: [] };
  const prisma = {
    tag: {
      create: async ({ data }) => {
        calls.creates.push(data);
        return { id: 'tag-1', usageCount: 0, ...data };
      },
      findFirst: async () => existingTag,
      update: async ({ data }) => {
        calls.updates.push(data);
        return { ...existingTag, ...data };
      },
    },
  };
  const audit = {
    write: async (entry) => {
      calls.audits.push(entry);
    },
  };
  return { service: new GovernanceService(prisma, audit), calls };
}

test('new tags start disabled and remain audited', async () => {
  const { service, calls } = fixture();

  const created = await service.createTag(user, { name: '  Regional market  ' });

  assert.equal(created.status, 'DISABLED');
  assert.equal(created.name, 'Regional market');
  assert.equal(created.normalizedName, 'regional market');
  assert.equal(calls.audits[0].action, 'taxonomy.tag.create');
});

test('tag status updates persist the requested lifecycle state', async () => {
  const existing = {
    id: 'tag-1',
    organizationId: user.organizationId,
    name: 'Regional market',
    normalizedName: 'regional market',
    status: 'DISABLED',
  };
  const { service, calls } = fixture(existing);

  const updated = await service.updateTag(user, existing.id, { status: 'ACTIVE' });

  assert.equal(updated.status, 'ACTIVE');
  assert.equal(calls.updates[0].status, 'ACTIVE');
  assert.equal(calls.audits[0].action, 'taxonomy.tag.update');
});
