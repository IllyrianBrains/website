// Shared by the member profile pages (/anetaret/<slug>/) at build time and by
// /anetaret/ and /rrjeti/postimet/ in the browser, so links and
// suggestions match everywhere. No data imports here — the browser bundles it.

// Some usernames came from the sheet as full names ("Gess Bendaj"), so the URL
// uses a slug: "gess-bendaj".
export const memberSlug = (username: string) => username
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');

export const memberUrl = (username: string) => `/anetaret/${memberSlug(username)}/`;

interface Suggestable {
  username: string;
  name: string;
  city?: string;
  fieldsOfExpertise?: string[];
  specialty?: string[];
  avatar?: string;
  aspirations?: { field?: string; subfield?: string; mentoring?: string[]; business?: string[] };
}

// Rank useful introductions, not just similar profiles. Complementary intentions
// count most; location and shared skills provide useful context.
export function relatedMembers<T extends Suggestable>(member: Suggestable, all: T[], limit = 6, exclude: string[] = []) {
  const lower = (values?: string[]) => new Set((values || []).map(value => value.toLocaleLowerCase('sq')));
  const fields = lower(member.fieldsOfExpertise), skills = lower(member.specialty);
  const city = member.city?.toLocaleLowerCase('sq');
  const intentions = [...(member.aspirations?.mentoring || []), ...(member.aspirations?.business || [])];
  const complementary = [
    { need: ['Lidhje me një mentor', 'Kërkoj mentor'], offer: ['Mundësi për të mentoruar', 'Dua të jem mentor'], offered: 'Mund të jetë mentor', sought: 'Kërkon mentorim' },
    { need: ['Mundësi pune', 'Kërkoj punë'], offer: ['Kandidatë për punësim', 'Punësoj'], offered: 'Po kërkon kandidatë', sought: 'Po kërkon mundësi pune' },
    { need: ['Financim për projekt / biznes', 'Kërkoj investim'], offer: ['Mundësi investimi', 'Dua të investoj'], offered: 'I interesuar për investim', sought: 'Po kërkon financim' },
  ];
  return all
    .filter(other => other.username !== member.username && !exclude.includes(other.username))
    .map(other => {
      const sameCity = Boolean(city && other.city?.toLocaleLowerCase('sq') === city);
      const sharedFields = (other.fieldsOfExpertise || []).filter(value => fields.has(value.toLocaleLowerCase('sq')));
      const sharedSkills = (other.specialty || []).filter(value => skills.has(value.toLocaleLowerCase('sq')));
      const aspired = member.aspirations?.field;
      const sameGoalField = Boolean(aspired && other.aspirations?.field?.toLocaleLowerCase('sq') === aspired.toLocaleLowerCase('sq'));
      const aspiredSubfield = member.aspirations?.subfield;
      const sameGoalSubfield = Boolean(aspiredSubfield && other.aspirations?.subfield?.toLocaleLowerCase('sq') === aspiredSubfield.toLocaleLowerCase('sq'));
      const worksInAspired = Boolean(aspired && (other.fieldsOfExpertise || []).includes(aspired));
      const mentors = worksInAspired && Boolean(other.aspirations?.mentoring?.some(value => ['Dua të jem mentor', 'Mundësi për të mentoruar'].includes(value)));
      const theirIntentions = [...(other.aspirations?.mentoring || []), ...(other.aspirations?.business || [])];
      const intentMatch = complementary.map(pair => {
        if (pair.need.some(value => intentions.includes(value)) && pair.offer.some(value => theirIntentions.includes(value))) return pair.offered;
        if (pair.offer.some(value => intentions.includes(value)) && pair.need.some(value => theirIntentions.includes(value))) return pair.sought;
        return '';
      }).find(Boolean);
      const sharedGoal = intentions.find(value => theirIntentions.includes(value) && ['Prezantim me bashkëthemelues', 'Prezantim me klientë / partnerë'].includes(value));
      const score = (intentMatch ? 6 : 0) + (sharedGoal ? 3 : 0) + (worksInAspired ? 4 : 0) + (mentors ? 2 : 0) + (sameGoalField ? 2 : 0) + (sameGoalSubfield ? 2 : 0) + sharedFields.length * 3 + (sameCity ? 2 : 0) + sharedSkills.length;
      const reason = [intentMatch, mentors ? "Mentor në " + aspired : worksInAspired ? "Ekspertizë në " + aspired : "", sameGoalSubfield ? "Synim i përbashkët: " + aspiredSubfield : sameGoalField ? "Synim i përbashkët: " + aspired : "", sharedGoal, ...sharedFields.map(value => "Fushë e përbashkët: " + value), sameCity ? "Edhe në " + other.city : "", ...sharedSkills.map(value => "Aftësi: " + value)].filter(Boolean).slice(0, 3).join(" · ");
      return { member: other, score, reason };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || Number(Boolean(b.member.avatar)) - Number(Boolean(a.member.avatar)) || a.member.name.localeCompare(b.member.name, 'sq'))
    .slice(0, limit)
    .map(({ member, reason, score }) => ({ member, reason, score }));
}

// ── Posts (supabase/007-social.sql), rendered in the browser ─────────────────
export interface MemberPost {
  id: number;
  body: string;
  created_at: string;
  username: string;
  name: string;
  headline?: string | null;
  avatar?: string | null;
  tags?: string[] | null;   // From supabase/009-tags.sql
}

export const initials = (name: string) => name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();

// Member text only ever goes in through textContent; bare http(s) links become
// real links (built as nodes, so nothing is parsed as HTML).
function linkify(parent: HTMLElement, text: string) {
  text.split(/(https?:\/\/[^\s<>"]+[^\s<>".,;:!?)])/g).forEach((part, index) => {
    if (index % 2) {
      const link = document.createElement('a');
      link.href = part;
      link.textContent = part;
      link.target = '_blank';
      link.rel = 'noreferrer nofollow';
      parent.append(link);
    } else if (part) parent.append(part);
  });
}

export function postElement(post: MemberPost, onDelete?: () => void) {
  const article = document.createElement('article');
  article.className = 'post-card';
  const head = document.createElement('a');
  head.className = 'post-card-author';
  head.href = memberUrl(post.username);
  if (post.avatar) {
    const img = document.createElement('img');
    img.src = post.avatar;
    img.alt = '';
    img.loading = 'lazy';
    img.className = 'post-card-avatar';
    head.append(img);
  } else {
    const fallback = document.createElement('span');
    fallback.className = 'post-card-avatar member-avatar-fallback';
    fallback.textContent = initials(post.name);
    head.append(fallback);
  }
  const who = document.createElement('span');
  const name = document.createElement('strong');
  name.textContent = post.name;
  const meta = document.createElement('small');
  meta.textContent = [post.headline, new Date(post.created_at).toLocaleDateString('sq-AL', { day: 'numeric', month: 'short', year: 'numeric' })].filter(Boolean).join(' · ');
  who.append(name, meta);
  head.append(who);
  const body = document.createElement('p');
  body.className = 'post-card-body';
  linkify(body, post.body);
  article.append(head, body);
  if (post.tags?.length) {
    const tags = document.createElement('p');
    tags.className = 'post-card-tags';
    post.tags.forEach(tag => {
      const chip = document.createElement('span');
      chip.className = 'feed-tag';
      chip.textContent = `#${tag}`;
      tags.append(chip);
    });
    article.append(tags);
  }
  if (onDelete) {
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'profile-editor-text-button post-card-delete';
    remove.textContent = 'Fshi';
    remove.addEventListener('click', onDelete);
    article.append(remove);
  }
  return article;
}

export const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character] || character));

export const safeHttpUrl = (value: string) => /^https?:\/\//i.test(value) ? encodeURI(value) : '#';
