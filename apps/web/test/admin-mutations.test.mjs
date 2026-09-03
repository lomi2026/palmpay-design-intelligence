import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('administration mutations refresh the current management view without a stale redirect', () => {
  const actions = read('../src/app/workspace/admin/actions.ts');

  assert.match(actions, /import \{ refresh, revalidatePath \} from 'next\/cache'/);
  assert.match(actions, /revalidatePath\('\/workspace\/admin'\)/);
  assert.match(actions, /revalidatePath\('\/workspace', 'layout'\)/);
  assert.match(actions, /refresh\(\)/);
  assert.doesNotMatch(actions, /redirect\(/);

  const expectedRefresh = {
    createCategoryAction: 'refreshAdmin()',
    createTagAction: 'refreshAdmin()',
    updateCategoryStatusAction: 'refreshAdmin()',
    updateTagStatusAction: 'refreshAdmin()',
    updateTeamAction: 'refreshAdmin(true)',
    updateUserStatusAction: 'refreshAdmin(true)',
    assignRoleAction: 'refreshAdmin(true)',
    removeUserRoleAction: 'refreshAdmin(true)',
  };

  for (const [actionName, refreshCall] of Object.entries(expectedRefresh)) {
    const action = actions.match(
      new RegExp(`export async function ${actionName}\\b[\\s\\S]*?(?=export async function|$)`),
    )?.[0];
    assert.ok(action, `${actionName} should exist`);
    assert.match(action, new RegExp(refreshCall.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('management selects submit the visible value and accept refreshed server defaults', () => {
  const nativeSelect = read('../src/components/ui/native-select.tsx');
  const adminPage = read('../src/app/workspace/admin/page.tsx');
  const submitButton = read('../src/app/workspace/admin/admin-submit-button.tsx');

  assert.match(nativeSelect, /submissionInput\.current\.value =/);
  assert.match(nativeSelect, /setUncontrolledValue\(initialValue\)/);
  assert.match(adminPage, /AdminSubmitButton/);
  assert.match(submitButton, /useFormStatus/);
  assert.match(submitButton, /disabled=\{pending \|\| disabled\}/);
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
