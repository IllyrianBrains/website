// Imports a member's experience and education from their LinkedIn profile PDF
// (on their own profile: More → Save to PDF, then they send it to us) into the
// Supabase member_experience / member_education tables (see supabase/schema.sql).
//
// Reads the PDF with `pdftotext` (poppler-utils — a system tool, not an npm
// dependency) and keeps only the main column, then splits it into entries on
// the vertical gaps between them. That handles LinkedIn's grouped layout
// (company, total duration, then several roles), but it's still a heuristic —
// so by default it only prints what it parsed. Check it, then re-run with
// --write, which replaces that member's experience/education rows.
//
// Only works with PDFs exported with LinkedIn's UI in English (it looks for
// the "Experience" / "Education" headings and English month names).
//
// The PDF has no photo, so members send one separately. --photo crops it to a
// centred square, shrinks it to 256px (with python3 + Pillow) and, with
// --write, uploads it to the public Supabase Storage bucket `avatars` as
// <username>.jpg and points members.avatar at it. Create that bucket once in
// the dashboard (Storage → New bucket → Public). In a dry run the resized
// photo is saved to a temp file so you can check the crop. The PDF is
// optional when only adding a photo.
//
// Needs SUPABASE_URL and SUPABASE_SECRET_KEY (the secret / service_role key —
// .env only, never CI or the repo). Keep the PDFs and photos in
// scripts/linkedin/, which is gitignored — they're personal data. Run with:
//   node --env-file=.env scripts/import-linkedin-pdf.mjs <username> [profile.pdf] [--photo <file>] [--write]

import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;

const AVATAR_BUCKET = 'avatars';
const AVATAR_SIZE = 256;

const MAIN_COLUMN_X = 150; // sidebar text starts at x≈22, the main column at x≈224
const ENTRY_GAP = 24;      // lines within an entry are ~15pt apart, entries ~40pt

// "December 2024 - Present (1 year 10 months)", "2019 - 2021"
const DATE_LINE = /^(?:[A-Z][a-z]+ )?(\d{4}) - (?:Present|(?:[A-Z][a-z]+ )?(\d{4}))(?: \(.+\))?$/;
// Total duration under a company that groups several roles: "3 years 2 months"
const DURATION_LINE = /^(?:\d+ years?(?: \d+ months?)?|\d+ months?|less than a year)$/;
const PAGE_FOOTER = /^Page \d+ of \d+$/;

const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const decode = (text) => text.replace(/&(\w+);/g, (match, name) => entities[name] ?? match);

// Main-column lines of the PDF, grouped into blocks separated by vertical gaps.
async function readBlocks(pdfPath) {
  const { stdout } = await promisify(execFile)('pdftotext', ['-bbox-layout', pdfPath, '-'], { maxBuffer: 16 * 1024 * 1024 });
  const blocks = [];
  let block = null, lastY = null;
  for (const page of stdout.split('<page ').slice(1)) {
    lastY = null; // a page break always starts a new block
    for (const [, x, y, inner] of page.matchAll(/<line xMin="([\d.]+)" yMin="([\d.]+)"[^>]*>([\s\S]*?)<\/line>/g)) {
      if (Number(x) < MAIN_COLUMN_X) continue;
      const text = decode([...inner.matchAll(/<word[^>]*>(.*?)<\/word>/g)].map((m) => m[1]).join(' ')).trim();
      if (!text || PAGE_FOOTER.test(text)) continue;
      if (lastY === null || Number(y) - lastY > ENTRY_GAP) blocks.push(block = []);
      block.push(text);
      lastY = Number(y);
    }
  }
  return blocks;
}

function parseExperience(blocks) {
  const experience = [];
  let groupCompany = null;
  for (const lines of blocks) {
    const dateIndex = lines.findIndex((line) => DATE_LINE.test(line));
    if (dateIndex === -1) {
      // Continuation of the previous description (a paragraph break or a page break).
      const last = experience.at(-1);
      if (last) last.description = [last.description, lines.join('\n')].filter(Boolean).join('\n\n');
      continue;
    }
    const before = lines.slice(0, dateIndex);
    const durationIndex = before.findIndex((line) => DURATION_LINE.test(line));
    let title, organization;
    if (durationIndex !== -1) {        // company, total duration, first role of a group
      groupCompany = organization = before.slice(0, durationIndex).join(' ');
      title = before.slice(durationIndex + 1).join(' ');
    } else if (before.length === 1) {  // another role under the same grouped company
      organization = groupCompany;
      title = before[0];
    } else {                           // company, role
      groupCompany = null;
      organization = before[0] || null;
      title = before.slice(1).join(' ');
    }
    const [, start, end] = lines[dateIndex].match(DATE_LINE);
    let rest = lines.slice(dateIndex + 1);
    // A short line right after the dates without a full stop is the location.
    const location = rest[0] && rest[0].length <= 60 && !/[.!?]$/.test(rest[0]) ? rest[0] : null;
    if (location) rest = rest.slice(1);
    experience.push({
      title: title || '(pa titull)',
      organization,
      location,
      start_year: Number(start),
      end_year: end ? Number(end) : null,
      is_current: !end,
      description: rest.join('\n') || null,
    });
  }
  return experience;
}

// School, then "Degree, Field · (2015 - 2019)" — the years may be missing.
function parseEducation(blocks) {
  return blocks.map(([school, ...rest]) => {
    const text = rest.join(' ');
    const years = text.match(/\((?:[A-Z][a-z]+ )?(\d{4})\s*-\s*(?:[A-Z][a-z]+ )?(\d{4})?\)/);
    const [degree, ...field] = text.replace(/\s*·?\s*\([^)]*\d{4}[^)]*\)\s*$/, '').split(', ');
    return {
      school,
      degree: degree || null,
      field: field.join(', ') || null,
      start_year: years ? Number(years[1]) : null,
      end_year: years?.[2] ? Number(years[2]) : null,
    };
  });
}

// Centred square crop, AVATAR_SIZE px, JPEG. Honours the EXIF rotation phones write.
async function resizePhoto(photoPath, outPath) {
  const script = `import sys
from PIL import Image, ImageOps
image = ImageOps.exif_transpose(Image.open(sys.argv[1])).convert('RGB')
ImageOps.fit(image, (${AVATAR_SIZE}, ${AVATAR_SIZE}), Image.LANCZOS).save(sys.argv[2], 'JPEG', quality=85, optimize=True)`;
  try {
    await promisify(execFile)('python3', ['-c', script, photoPath, outPath]);
  } catch (err) {
    throw new Error(`Resizing the photo failed — is it an image file? (Needs python3 with Pillow: pip install pillow.)\n${err.stderr || err.message}`);
  }
}

async function uploadAvatar(username, jpegPath) {
  const objectPath = `${AVATAR_BUCKET}/${encodeURIComponent(username)}.jpg`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${objectPath}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      ...(SUPABASE_SECRET_KEY.startsWith('eyJ') && { Authorization: `Bearer ${SUPABASE_SECRET_KEY}` }),
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true',
    },
    body: await readFile(jpegPath),
  });
  if (!response.ok) throw new Error(`Photo upload → HTTP ${response.status}: ${await response.text()}`);
  // Same path on every re-upload, so bust browser/CDN caches with a version.
  return `${SUPABASE_URL}/storage/v1/object/public/${objectPath}?v=${Date.now()}`;
}

async function supabase(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      ...(SUPABASE_SECRET_KEY.startsWith('eyJ') && { Authorization: `Bearer ${SUPABASE_SECRET_KEY}` }),
      'Content-Type': 'application/json',
    },
    ...(body && { body: JSON.stringify(body) }),
  });
  if (!response.ok) throw new Error(`${method} ${path} → HTTP ${response.status}: ${await response.text()}`);
  return response.status === 204 || response.status === 201 ? null : response.json();
}

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const photoAt = args.indexOf('--photo');
  const photoPath = photoAt === -1 ? null : args[photoAt + 1];
  const [username, pdfPath] = args.filter((arg, i) => !arg.startsWith('--') && (photoAt === -1 || i !== photoAt + 1));
  if (!username || (!pdfPath && !photoPath)) throw new Error('Usage: node --env-file=.env scripts/import-linkedin-pdf.mjs <username> [profile.pdf] [--photo <file>] [--write]');

  let experience = null, education = null, pdfName = null;
  if (pdfPath) {
    const blocks = await readBlocks(pdfPath);
    const heading = (name) => blocks.findIndex((lines) => lines.length === 1 && lines[0] === name);
    const experienceAt = heading('Experience'), educationAt = heading('Education');
    if (experienceAt === -1 && educationAt === -1) throw new Error('No "Experience" or "Education" heading found — is this a LinkedIn profile PDF exported in English?');
    const sectionEnd = (start) => [experienceAt, educationAt, blocks.length].filter((i) => i > start).sort((a, b) => a - b)[0];
    experience = experienceAt === -1 ? [] : parseExperience(blocks.slice(experienceAt + 1, sectionEnd(experienceAt)));
    education = educationAt === -1 ? [] : parseEducation(blocks.slice(educationAt + 1, sectionEnd(educationAt)));
    pdfName = blocks[0]?.[0];
    console.log(JSON.stringify({ name: pdfName, experience, education }, null, 2));
  }

  let avatarPath = null;
  if (photoPath) {
    avatarPath = join(tmpdir(), `avatar-${username}.jpg`);
    await resizePhoto(photoPath, avatarPath);
    console.log(`Photo resized to ${AVATAR_SIZE}×${AVATAR_SIZE}: ${avatarPath}`);
  }

  if (!write) {
    console.log('\nDry run — check the above, then re-run with --write to save it.');
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env first.');
  const [member] = await supabase(`members?username=eq.${encodeURIComponent(username)}&select=id,name`);
  if (!member) throw new Error(`No member with username "${username}".`);
  if (pdfName && pdfName !== member.name) console.warn(`Note: the PDF is for "${pdfName}", the member is "${member.name}".`);

  if (pdfPath) {
    await supabase(`member_experience?member_id=eq.${member.id}`, { method: 'DELETE' });
    await supabase(`member_education?member_id=eq.${member.id}`, { method: 'DELETE' });
    if (experience.length) await supabase('member_experience', { method: 'POST', body: experience.map((e, i) => ({ ...e, member_id: member.id, sort_order: i })) });
    if (education.length) await supabase('member_education', { method: 'POST', body: education.map((e, i) => ({ ...e, member_id: member.id, sort_order: i })) });
    console.log(`Saved ${experience.length} experience and ${education.length} education row(s) for ${username}.`);
  }
  if (avatarPath) {
    const avatar = await uploadAvatar(username, avatarPath);
    await supabase(`members?id=eq.${member.id}`, { method: 'PATCH', body: { avatar } });
    console.log(`Uploaded photo for ${username}: ${avatar}`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
