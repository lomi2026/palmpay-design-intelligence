import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('dark theme uses the approved low-glare semantic palette', () => {
  const css = read('../src/app/globals.css');

  for (const declaration of [
    '--v9-bg: #121416',
    '--v9-sidebar: #0f1113',
    '--v9-panel: #15181b',
    '--v9-panel-2: #181b1f',
    '--v9-panel-3: #20242a',
    '--v9-text: #e1e5e9',
    '--v9-copy: #a5acb5',
    '--v9-subtle: #9099a5',
    '--background: #121416',
    '--foreground: #e1e5e9',
  ]) {
    assert.match(css, new RegExp(declaration.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('large governance callouts no longer flash pure white in dark mode', () => {
  const calloutFiles = [
    '../src/app/workspace/insights/page.tsx',
    '../src/app/workspace/overview/page.tsx',
    '../src/app/workspace/ai-projects/[slug]/page.tsx',
  ];

  for (const file of calloutFiles) {
    const source = read(file);
    assert.doesNotMatch(source, /bg-white p-6 text-black/);
    assert.doesNotMatch(source, /border-white bg-white py-0 text-\[#090909\]/);
    assert.match(source, /bg-\[var\(--v9-panel-2\)\]/);
  }
});
