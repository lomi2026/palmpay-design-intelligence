import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

function actions() {
  const source = readFileSync(new URL('../src/app/workspace/submit/actions.ts', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const requests = [];
  const actionModule = { exports: {} };
  const imports = {
    '@/lib/auth': { authenticatedApiHeaders: async () => ({ Authorization: 'test' }) },
    '@/lib/api': { serverApiFetch: async (path, init) => { requests.push({ path, ...init }); return { id: 'draft' }; } },
    'next/navigation': { redirect: () => {} },
  };
  runInNewContext(code, { module: actionModule, exports: actionModule.exports, require: (name) => imports[name] });
  return { actions: actionModule.exports, requests };
}

test('create, autosave and preview all submit the category and multiple tag IDs', async () => {
  const f = new FormData();
  f.set('id', 'draft'); f.set('contentType', 'AI_SKILL'); f.set('title', 'test'); f.set('categoryId', 'category');
  f.append('tagIds', 'tag-1'); f.append('tagIds', 'tag-2');
  const a = actions();
  await a.actions.createDraftAction({}, f);
  await a.actions.autosaveDraftAction({}, f);
  await a.actions.saveAndPreviewDraftAction(f);
  assert.equal(a.requests.length, 3);
  for (const request of a.requests) {
    const body = JSON.parse(request.body);
    assert.equal(body.categoryId, 'category');
    assert.deepEqual(body.tagIds, ['tag-1', 'tag-2']);
    assert.equal(request.headers.Authorization, 'test');
  }
});

test('cleared category and tags are sent explicitly, not omitted on save', async () => {
  const f = new FormData(); f.set('id', 'draft'); f.set('contentType', 'AI_SKILL'); f.set('title', 'test');
  const a = actions(); await a.actions.autosaveDraftAction({}, f);
  const body = JSON.parse(a.requests[0].body);
  assert.equal(body.categoryId, null);
  assert.deepEqual(body.tagIds, []);
});

test('catalog options exclude disabled records while draft controls preserve selected historical values', () => {
  const filters = readFileSync(new URL('../src/components/workspace/catalog-filter-controls.tsx', import.meta.url), 'utf8');
  const fields = readFileSync(new URL('../src/components/workspace/taxonomy-fields.tsx', import.meta.url), 'utf8');
  const editor = readFileSync(new URL('../src/app/workspace/submit/draft-editor.tsx', import.meta.url), 'utf8');
  assert.match(filters, /category\?\.status === 'ACTIVE'/);
  assert.match(filters, /tag.status === 'ACTIVE'/);
  assert.match(fields, /contentTypes.includes\(contentType\)/);
  assert.match(fields, /tag.status === 'ACTIVE' \|\| tagIds.includes\(tag.id\)/);
  assert.match(fields, /已停用/);
  assert.match(editor, /onResetCapture/);
  assert.match(editor, /onChange=\{scheduleAutosave\}/);
});
