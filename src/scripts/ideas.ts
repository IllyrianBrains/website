// Shared by the Mundësitë feed (/projektet/ide/, formerly "Ndaj Ide"), each
// idea's page, the network feed on /rrjeti/ and their live reloads in the
// browser, so an idea looks the same wherever it's rendered.
import { Marked } from 'marked';
import { initials, memberUrl } from './members';

export interface Idea {
  id?: number;              // Supabase id = the public "#" number
  slug: string;
  title: string;
  description: string;      // Markdown
  tags?: string[];          // free-form, see supabase/009-tags.sql
  name?: string | null;
  email?: string | null;
  resolved?: boolean;
  source?: string;
  date?: string;
  // From supabase/008-feed.sql: only when the author showed their name and is an approved member.
  author_username?: string | null;
  author_avatar?: string | null;
  author_headline?: string | null;
}

// A public_ideas row as the pages use it (the build sync does the same).
export const ideaFromRow = ({ contact_email, created_at, ...idea }: any): Idea => ({ ...idea, email: contact_email || '', date: created_at });

export const ORG_EMAIL = 'illyrianbrains@gmail.com';

// Descriptions are written by members, so raw HTML is escaped rather than
// passed through (CommonMark autolinks like <https://…> aren't raw HTML and
// still work), and links/images may only point to http(s), mailto or the site.
const markdown = new Marked({
  renderer: { html(token) {
    const raw = typeof token === 'string' ? token : (token as { text: string }).text;
    return raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  } },
  walkTokens(token) {
    if ((token.type === 'link' || token.type === 'image') && !/^(https?:|mailto:|\/|#)/i.test(token.href.trim())) token.href = '#';
  },
});
export const renderMarkdown = (text: string) => markdown.parse(text || '', { async: false }) as string;

const stripTags = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
export const plainText = (text: string) => stripTags(renderMarkdown(text));

// The list shows a plain-text excerpt, not the rendered Markdown — a rich
// post's headings/lists/tables read as clutter squeezed into a list row.
export const excerpt = (text: string, length = 220) => text.length > length ? text.slice(0, length).replace(/\s+\S*$/, '') + '…' : text;

export const formatDate = (date?: string) => date && !isNaN(Date.parse(date))
  ? new Date(date).toLocaleDateString('sq-AL', { day: 'numeric', month: 'long', year: 'numeric' })
  : '';

// Replies go to the author when they chose to show their email, otherwise to
// the org inbox — so every idea stays respondable.
export const ideaMailto = (idea: Idea, number: number) => idea.email
  ? `mailto:${idea.email}?subject=${encodeURIComponent(`Ide #${number} · ${idea.title}`)}&body=${encodeURIComponent(`Përshëndetje,\n\nPo të shkruaj për idenë #${number} "${idea.title}" që ndave në Illyrian Brains.`)}`
  : `mailto:${ORG_EMAIL}?subject=${encodeURIComponent(`Ide #${number} · ${idea.title}`)}&body=${encodeURIComponent(`Përshëndetje,\n\nKjo ide (#${number} "${idea.title}") nuk ka email të drejtpërdrejtë — a mund t’ia përcillni autorit?`)}`;

const escapeHtml = (value: unknown) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');


// One idea as a LinkedIn-style feed card, as HTML — used for the build-time
// list and for the live reloads in the browser, so both render identically.
// Every value is escaped; the description only ever goes through
// renderMarkdown. hasPage: the idea's own page was built at deploy time —
// otherwise (published since) the full text opens inside the card instead.
export function ideaRowHtml(idea: Idea, number: number, hasPage: boolean) {
  const text = plainText(idea.description);
  const date = formatDate(idea.date);
  const href = `/projektet/ide/${encodeURIComponent(idea.slug)}/`;
  const author = idea.name || 'Anëtar i rrjetit';
  const avatar = idea.author_avatar
    ? `<img class="post-card-avatar" src="${escapeHtml(idea.author_avatar)}" alt="" loading="lazy">`
    : `<span class="post-card-avatar member-avatar-fallback">${escapeHtml(idea.name ? initials(idea.name) : 'IB')}</span>`;
  const who = `${avatar}<span><strong>${escapeHtml(author)}</strong><small>${escapeHtml([idea.author_headline, date].filter(Boolean).join(' · '))}</small></span>`;
  return `<li class="idea-row" data-slug="${escapeHtml(idea.slug)}" data-tags="${escapeHtml(JSON.stringify(idea.tags || []))}" data-date="${escapeHtml(idea.date || '')}" data-search="${escapeHtml(`${idea.title} ${idea.name || ''} ${(idea.tags || []).join(' ')} ${text}`.toLocaleLowerCase('sq'))}">`
    + `<div class="idea-row-head">${idea.author_username ? `<a class="post-card-author" href="${memberUrl(idea.author_username)}">${who}</a>` : `<span class="post-card-author">${who}</span>`}`
    + `<span class="idea-row-number">#${number}</span></div>`
    + `<div class="idea-row-badges">${(idea.tags || []).map(tag => `<span class="feed-tag">#${escapeHtml(tag)}</span>`).join('')}<span class="idea-status ${idea.resolved ? 'is-resolved' : 'is-open'}">${idea.resolved ? 'E zgjidhur' : 'Ende aktive'}</span></div>`
    + `<h3 class="idea-row-title">${hasPage ? `<a href="${href}">${escapeHtml(idea.title)}</a>` : escapeHtml(idea.title)}</h3>`
    + `<p class="idea-row-desc">${escapeHtml(excerpt(text))}</p>`
    + (hasPage ? '' : `<details class="idea-row-full"><summary>Lexo më shumë <span aria-hidden="true">↓</span></summary><div class="idea-row-rich">${renderMarkdown(idea.description)}</div></details>`)
    + `<div class="idea-row-foot">${hasPage ? `<a class="idea-row-more" href="${href}">Lexo më shumë <span aria-hidden="true">→</span></a>` : ''}`
    + `<a class="idea-row-reply" href="${escapeHtml(ideaMailto(idea, number))}">Përgjigju me email <span aria-hidden="true">↗</span></a></div></li>`;
}

// Tag chips for filtering a list whose items carry data-tags (a JSON array): the
// tags on the items, most used first. Any number can be picked; an item matches
// when it has at least one of them. Call render() whenever the items change.
export function tagFilter(container: HTMLElement, onChange: () => void) {
  const selected = new Set<string>();
  const key = (tag: string) => tag.toLocaleLowerCase('sq');
  const tagsOf = (item: HTMLElement): string[] => { try { return JSON.parse(item.dataset.tags || '[]'); } catch { return []; } };
  const render = (items: HTMLElement[]) => {
    const counts = new Map<string, { label: string; count: number }>();
    items.forEach(item => tagsOf(item).forEach(tag => {
      const entry = counts.get(key(tag));
      if (entry) entry.count++;
      else counts.set(key(tag), { label: tag, count: 1 });
    }));
    [...selected].forEach(tag => { if (!counts.has(tag)) selected.delete(tag); });
    container.replaceChildren(...[...counts].sort((a, b) => b[1].count - a[1].count || a[1].label.localeCompare(b[1].label, 'sq')).map(([tag, { label, count }]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `#${label} `;
      const small = document.createElement('small');
      small.textContent = String(count);
      button.append(small);
      button.setAttribute('aria-pressed', String(selected.has(tag)));
      button.addEventListener('click', () => {
        if (selected.has(tag)) selected.delete(tag);
        else selected.add(tag);
        button.setAttribute('aria-pressed', String(selected.has(tag)));
        onChange();
      });
      return button;
    }));
    container.hidden = !counts.size;
  };
  const matches = (item: HTMLElement) => !selected.size || tagsOf(item).some(tag => selected.has(key(tag)));
  return { render, matches };
}
