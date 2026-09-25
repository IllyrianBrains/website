// Unit tests for the shared helpers in src/scripts/ and src/data/csv.ts.
// Run with `npm test` (Node's built-in test runner, no dependencies).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memberSlug, memberUrl, initials, relatedMembers } from '../src/scripts/members.ts';
import { renderMarkdown, plainText, excerpt, ideaMailto, ideaRowHtml, ORG_EMAIL } from '../src/scripts/ideas.ts';
import { parseCsv, csvRows } from '../src/data/csv.ts';

test('memberSlug makes URL-safe slugs from usernames with spaces and diacritics', () => {
  assert.equal(memberSlug('Gess Bendaj'), 'gess-bendaj');
  assert.equal(memberSlug('Ëndri Çela'), 'endri-cela');
  assert.equal(memberSlug('  john.doe_1 '), 'john.doe_1');
  assert.equal(memberUrl('Gess Bendaj'), '/anetaret/gess-bendaj/');
});

test('initials takes the first letters of up to two words', () => {
  assert.equal(initials('Ana Maria Hoxha'), 'AM');
  assert.equal(initials('ana'), 'A');
});

test('relatedMembers ranks by shared city, fields, aspired field and skills', () => {
  const me = { username: 'me', name: 'Me', city: 'Berlin', fieldsOfExpertise: ['Tech'], specialty: ['Python'], aspirations: { field: 'Shëndeti' } };
  const all = [
    me,
    { username: 'none', name: 'No Match', city: 'Roma', fieldsOfExpertise: ['Arte'] },
    { username: 'city', name: 'Same City', city: 'berlin' },
    { username: 'field', name: 'Same Field', fieldsOfExpertise: ['Tech'], specialty: ['python'] },
    { username: 'mentor', name: 'Mentor', fieldsOfExpertise: ['Shëndeti'], aspirations: { mentoring: ['Dua të jem mentor'] } },
  ];
  const result = relatedMembers(me, all, 10);
  const names = result.map(item => item.member.username);
  assert.ok(!names.includes('me'), 'never suggests the member themself');
  assert.ok(!names.includes('none'), 'skips members sharing nothing');
  assert.deepEqual(names, ['mentor', 'city', 'field']);   // all score 3 (city 3 · field 2 + skill 1 · aspired field 2 + mentor 1), ties by name
  assert.match(result.find(item => item.member.username === 'mentor').reason, /Mentor në Shëndeti/);
  assert.equal(relatedMembers(me, all, 1).length, 1, 'respects the limit');
  assert.ok(!relatedMembers(me, all, 10, ['city']).some(item => item.member.username === 'city'), 'respects exclude');
});

test('renderMarkdown escapes raw HTML and drops unsafe links', () => {
  const html = renderMarkdown('<script>alert(1)</script>\n\n[x](javascript:alert(1)) [ok](https://example.com) ![i](data:image/png;base64,AA)');
  assert.ok(!html.includes('<script>'), 'raw HTML is escaped');
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!/javascript:/i.test(html), 'javascript: links are removed');
  assert.ok(!html.includes('data:image'), 'data: images are removed');
  assert.ok(html.includes('href="https://example.com"'), 'https links are kept');
});

test('plainText and excerpt shorten Markdown for list rows', () => {
  assert.equal(plainText('**Hello** _world_'), 'Hello world');
  const long = 'fjalë '.repeat(100);
  const short = excerpt(long, 50);
  assert.ok(short.length <= 51 && short.endsWith('…'));
  assert.equal(excerpt('short'), 'short');
});

test('ideaMailto replies to the author, or to the org inbox without an email', () => {
  assert.match(ideaMailto({ slug: 'a', title: 'T', description: '', email: 'a@b.com' }, 3), /^mailto:a@b\.com\?/);
  assert.ok(ideaMailto({ slug: 'a', title: 'T', description: '' }, 3).startsWith(`mailto:${ORG_EMAIL}?`));
});

test('ideaRowHtml escapes every member-written value', () => {
  const evil = '"><img src=x onerror=alert(1)>';
  const html = ideaRowHtml({ slug: evil, title: evil, description: evil, name: evil, tags: [evil], author_avatar: evil }, 1, false);
  assert.ok(!html.includes('<img src=x'), 'no injected tag');
  assert.ok(!html.includes('onerror=alert(1)>'), 'no injected attribute');
  assert.ok(html.includes('<details class="idea-row-full">'), 'ideas without a built page open inline');
  assert.ok(ideaRowHtml({ slug: 'a', title: 'T', description: 'd' }, 1, true).includes('href="/projektet/ide/a/"'));
});

test('parseCsv handles quotes, escaped quotes, CRLF and blank lines', () => {
  assert.deepEqual(parseCsv('a,b\r\n"x, y","he said ""hi"""\n\n1,\n'), [['a', 'b'], ['x, y', 'he said "hi"'], ['1', '']]);
  assert.deepEqual(parseCsv('a\n"multi\nline"'), [['a'], ['multi\nline']]);
});

test('csvRows reads columns by header name, trimmed, blank when missing', () => {
  const [row] = csvRows('city,country\n Berlin ,Germany\n');
  assert.equal(row.col('city'), 'Berlin');
  assert.equal(row.col('missing'), '');
});
