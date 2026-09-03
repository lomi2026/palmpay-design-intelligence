import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('administration mutations invalidate prefetched management data before redirecting', () => {
  const actions = read('../src/app/workspace/admin/actions.ts');

  assert.match(actions, /import \{ revalidatePath \} from 'next\/cache'/);
  assert.match(actions, /revalidatePath\('\/workspace\/admin'\)/);
  assert.match(actions, /revalidatePath\('\/workspace', 'layout'\)/);

  const expectedRefresh = {
    createCategoryAction: "refreshAdmin('taxonomy')",
    createTagAction: "refreshAdmin('taxonomy')",
    updateCategoryStatusAction: "refreshAdmin('taxonomy')",
    updateTagStatusAction: "refreshAdmin('taxonomy')",
    updateTeamAction: "refreshAdmin('teams', true)",
    updateUserStatusAction: "refreshAdmin('users', true)",
    assignRoleAction: "refreshAdmin('roles', true)",
    removeUserRoleAction: "refreshAdmin('roles', true)",
  };

  for (const [actionName, refreshCall] of Object.entries(expectedRefresh)) {
    const action = actions.match(
      new RegExp(`export async function ${actionName}\\b[\\s\\S]*?(?=export async function|$)`),
    )?.[0];
    assert.ok(action, `${actionName} should exist`);
    assert.match(action, new RegExp(refreshCall.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('tags are disabled until an administrator explicitly enables them', () => {
  const schema = read('../../api/prisma/schema.prisma');
  const migration = read(
    '../../api/prisma/migrations/20260904090000_disable_tags_by_default/migration.sql',
  );

  assert.match(schema, /status\s+TagStatus @default\(DISABLED\)/);
  assert.match(migration, /ALTER COLUMN "status" SET DEFAULT 'disabled'/);
  assert.match(migration, /WHERE "status" = 'active'/);
});

test('role assignment excludes roles the user already owns', () => {
  const adminPage = read('../src/app/workspace/admin/page.tsx');

  assert.match(adminPage, /const assignedRoleIds = new Set/);
  assert.match(adminPage, /roles\.filter\(\(role\) => !assignedRoleIds\.has\(role\.id\)\)/);
  assert.match(adminPage, /已拥有全部角色/);
});
