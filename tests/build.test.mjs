// Checks the built site in dist/ — run `npm run build` first (`npm test` skips
// these when there is no build). Catches what breaks silently on deploy:
// missing pages, broken internal links, secrets bundled into the output.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const skip = existsSync(join(dist, 'index.html')) ? false : 'no build in dist/ — run `npm run build` first';

const walk = dir => readdirSync(dir).flatMap(name => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const files = skip ? [] : walk(dist);
const htmlFiles = files.filter(file => file.endsWith('.html'));
const page = route => readFileSync(join(dist, route, 'index.html'), 'utf8');

test('key pages are built', { skip }, () => {
  for (const route of ['', 'qytetet', 'anetaret', 'shoqatat', 'bizneset', 'eventet', 'misioni', 'ekipet', 'statuti',
    'anetaresohu', 'anetaresohu/regjistrohu', 'anetaresohu/profili', 'anetaresohu/rrjeti', 'anetaresohu/admin', 'rrjeti/postimet', 'projektet/ide']) {
    assert.ok(existsSync(join(dist, route, 'index.html')), `/${route}${route ? '/' : ''} is missing`);
  }
});

test('every internal link and asset points to a built file', { skip }, () => {
  const exists = path => existsSync(path) && (statSync(path).isFile() || existsSync(join(path, 'index.html')));
  const broken = new Set();
  for (const file of htmlFiles) {
    // Inline scripts build links from template strings ("/qytetet/${slug}/"): only real markup counts.
    const html = readFileSync(file, 'utf8').replace(/<script\b[\s\S]*?<\/script>/gi, '');
    for (const [, url] of html.matchAll(/\s(?:href|src)="(\/(?!\/)[^"#?]*)/g)) {
      let path;
      try { path = decodeURI(url); } catch { path = url; }
      if (!exists(join(dist, path)) && !exists(join(dist, path + '.html'))) broken.add(`${url}  (in /${relative(dist, file)})`);
    }
  }
  assert.deepEqual([...broken].slice(0, 25), [], `${broken.size} broken internal link(s)`);
});

test('no secret keys end up in the public build', { skip }, () => {
  const secret = process.env.SUPABASE_SECRET_KEY;
  for (const file of files.filter(file => /\.(html|js|json|css|txt|xml)$/.test(file))) {
    const text = readFileSync(file, 'utf8');
    assert.ok(!/sb_secret_[A-Za-z0-9_-]{10,}/.test(text), `Supabase secret key in ${relative(dist, file)}`);
    assert.ok(!/"role"\s*:\s*"service_role"/.test(text), `service_role key in ${relative(dist, file)}`);
    if (secret) assert.ok(!text.includes(secret), `SUPABASE_SECRET_KEY value in ${relative(dist, file)}`);
  }
});

test('no page renders "undefined" or "[object Object]" into links or text', { skip }, () => {
  const bad = htmlFiles.filter(file => /(?:href|src)="(?:undefined|null)"|\[object Object\]/.test(readFileSync(file, 'utf8')));
  assert.deepEqual(bad.map(file => relative(dist, file)), []);
});

test('writing posts and ideas/requests is hidden (postsEnabled/ideasEnabled in rrjeti/postimet.astro)', { skip }, () => {
  const html = page('rrjeti/postimet');
  assert.match(html, /<section class="activity-composer"[^>]*\shidden/, 'the composer is visible again — update this test if that was intended');
  assert.ok(!/data-compose=/.test(html), 'no "write" button on Postimet');
  const linking = htmlFiles.filter(file => /href="\/rrjeti\/postimet\/#(?:shkruaj-ide|post-body)"/.test(readFileSync(file, 'utf8')));
  assert.deepEqual(linking.map(file => relative(dist, file)), [], 'pages still link to the hidden composer');
});
