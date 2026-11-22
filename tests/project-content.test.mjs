import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('selected work lists projects in the expected order', () => {
  const order = [...html.matchAll(/data-project="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(order, ['follow-me-to-budapest', 'stephen-beratung', 'cv-peers']);
});

test('removed projects are not referenced in the html', () => {
  assert.doesNotMatch(html, /curators-path/);
  assert.doesNotMatch(html, /muzma/i);
});

test('Follow Me to Budapest links to its site and exposes an accessible preview', () => {
  const project = html.match(/<article[^>]*data-project="follow-me-to-budapest"[\s\S]*?<\/article>/)?.[0];
  assert.ok(project, 'Follow Me to Budapest is listed in selected work');
  assert.match(project, /href="https:\/\/followmetobudapest\.com" target="_blank" rel="noopener noreferrer"/);
  assert.match(project, /id="panel-follow-me-to-budapest"/);
  const img = project.match(/<img[^>]*src="assets\/work\/follow-me-to-budapest\.jpg"[^>]*>/)?.[0];
  assert.ok(img, 'preview image uses the bundled jpg');
  assert.match(img, /alt="[^"]+"/);
  assert.ok(existsSync(new URL('../assets/work/follow-me-to-budapest.jpg', import.meta.url)), 'preview jpg exists on disk');
});
