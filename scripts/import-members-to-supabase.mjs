// One-time migration: copies every row of the members Google Sheet into the
// Supabase `members` table (see supabase/schema.sql), including the private
// email and status columns the site build never reads.
//
// Bios are cleaned of the forum's HTML (<br>, &amp; …) into plain text, and a
// bio written as "Eksperienca: A, Org - B, Org" / "Studimet: MSc. Field, School"
// lines is split into member_experience / member_education rows; whatever
// isn't in those lines stays as the About text. Check the result in the
// dashboard afterwards — the split is a heuristic.
//
// Needs MEMBERS_SHEET_CSV_URL, SUPABASE_URL and SUPABASE_SECRET_KEY (the
// secret / service_role key — it bypasses RLS to write). Keep the secret key
// in .env only; it must never go into CI or the repo.
//
// Upserts by username, so re-running updates members rather than duplicating
// them — but it overwrites edits made in Supabase since, and replaces the
// experience/education rows of any member whose bio gets split. Run with:
//   node --env-file=.env scripts/import-members-to-supabase.mjs

const { MEMBERS_SHEET_CSV_URL, SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;

// Same parser as sync-members-sheet.mjs.
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c === '\r') { /* skip, \n handles the line break */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const splitList = (value, separator = ';') => (value || '').split(separator).map((v) => v.trim()).filter(Boolean);

const entities = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", '#039': "'", nbsp: ' ', hellip: '…', ndash: '–', mdash: '—' };
const htmlToText = (html) => html
  .replace(/<br\s*\/?>\s*/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&(#?\w+);/g, (match, name) => entities[name] ?? match)
  .trim();

// "Inxhinier, Instituti GFZ" → { title: "Inxhinier", organization: "Instituti GFZ" }
const parseExperience = (item) => {
  const [title, ...rest] = item.split(', ');
  return { title: title.trim(), organization: rest.join(', ').trim() || null };
};
// "Msc. Psychology, Neuroscience, Uni Pavia" → { degree: "Msc.", field: "Psychology, Neuroscience", school: "Uni Pavia" }
const parseEducation = (item) => {
  const parts = item.replace(/\.$/, '').split(', ');
  const school = parts.length > 1 ? parts.pop().trim() : null;
  const study = parts.join(', ').trim();
  const degree = study.match(/^(B\.?Sc|M\.?Sc|B\.?A|M\.?A|MBA|Ph\.?D|Bachelor|Master)\b\.?/i)?.[0] || null;
  const field = (degree ? study.slice(degree.length) : study).trim() || null;
  return school ? { school, degree, field } : { school: study, degree: null, field: null };
};

function splitBio(bio) {
  const experience = [], education = [], about = [];
  for (const line of bio.split('\n')) {
    const match = line.match(/^\s*(Eksperienca|Përvoja|Studimet|Arsimimi)\s*:\s*(.+)$/i);
    if (!match) { about.push(line); continue; }
    const items = match[2].replace(/\.$/, '').split(/\s+-\s+/).filter(Boolean);
    if (/^(Eksperienca|Përvoja)$/i.test(match[1])) experience.push(...items.map(parseExperience));
    else education.push(...items.map(parseEducation));
  }
  return { about: about.join('\n').trim() || null, experience, education };
}

async function supabase(path, { method = 'GET', body, prefer } = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      ...(SUPABASE_SECRET_KEY.startsWith('eyJ') && { Authorization: `Bearer ${SUPABASE_SECRET_KEY}` }),
      'Content-Type': 'application/json',
      ...(prefer && { Prefer: prefer }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });
  if (!response.ok) throw new Error(`${method} ${path} → HTTP ${response.status}: ${await response.text()}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function main() {
  if (!MEMBERS_SHEET_CSV_URL || !SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error('Set MEMBERS_SHEET_CSV_URL, SUPABASE_URL and SUPABASE_SECRET_KEY in .env first.');
  }
  const response = await fetch(MEMBERS_SHEET_CSV_URL, { headers: { 'User-Agent': 'illyrianbrains.org-build' } });
  if (!response.ok) throw new Error(`Sheet HTTP ${response.status}`);
  const [header, ...records] = parseCsv(await response.text());
  const get = (r, name) => (header.indexOf(name) === -1 ? '' : (r[header.indexOf(name)] || '').trim());

  const rows = records.filter((r) => get(r, 'name') && get(r, 'username')).map((r) => {
    const { about, experience, education } = splitBio(htmlToText(get(r, 'bio')));
    const since = parseInt(get(r, 'since'), 10);
    return {
      member: {
        username: get(r, 'username'),
        name: get(r, 'name'),
        email: get(r, 'email') || null,
        status: get(r, 'status').toLowerCase() || 'pending',
        headline: get(r, 'title') || null,
        company: get(r, 'company') || null,
        city: get(r, 'city') || null,
        country: get(r, 'country') || null,
        about,
        fields_of_expertise: splitList(get(r, 'fieldsOfExpertise'), ','),
        skills: splitList(get(r, 'specialty')),
        website: get(r, 'website') || null,
        linkedin_url: get(r, 'linkedinUrl') || null,
        avatar: get(r, 'avatar') || null,
        profile_url: get(r, 'profileUrl') || null,
        member_since: isNaN(since) ? null : since,
        groups: splitList(get(r, 'groups')),
        teams: splitList(get(r, 'team'), ','),
      },
      experience,
      education,
    };
  });

  const saved = await supabase('members?on_conflict=username&select=id,username', {
    method: 'POST', body: rows.map((row) => row.member), prefer: 'resolution=merge-duplicates,return=representation',
  });
  const idByUsername = new Map(saved.map((row) => [row.username, row.id]));
  console.log(`Upserted ${saved.length} member(s).`);

  for (const { member, experience, education } of rows) {
    if (!experience.length && !education.length) continue;
    const memberId = idByUsername.get(member.username);
    await supabase(`member_experience?member_id=eq.${memberId}`, { method: 'DELETE' });
    await supabase(`member_education?member_id=eq.${memberId}`, { method: 'DELETE' });
    if (experience.length) await supabase('member_experience', { method: 'POST', body: experience.map((e, i) => ({ ...e, member_id: memberId, sort_order: i })) });
    if (education.length) await supabase('member_education', { method: 'POST', body: education.map((e, i) => ({ ...e, member_id: memberId, sort_order: i })) });
    console.log(`Split bio of ${member.username}: ${experience.length} experience, ${education.length} education row(s).`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
