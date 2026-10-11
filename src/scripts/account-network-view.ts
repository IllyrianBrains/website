import { initials, memberUrl } from './members';

export const preview = (value: string, limit = 220) => {
  const text = (value || '').replaceAll('\n', ' ').replaceAll('\t', ' ').split(' ').filter(Boolean).join(' ').trim();
  return text.length <= limit ? text : `${text.slice(0, limit - 1).trimEnd()}…`;
};

export const avatarElement = (member: any) => {
  const avatar = document.createElement(member.avatar ? 'img' : 'span') as HTMLImageElement;
  avatar.className = `member-avatar${member.avatar ? '' : ' member-avatar-fallback'}`;
  if (member.avatar) {
    avatar.src = member.avatar;
    avatar.alt = '';
    avatar.loading = 'lazy';
  } else avatar.textContent = initials(member.name);
  return avatar;
};

export const personRow = (member: any, action?: HTMLElement, note = '') => {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.href = memberUrl(member.username);
  const text = document.createElement('span');
  const name = document.createElement('strong');
  name.textContent = member.name;
  const detail = document.createElement('small');
  detail.textContent = note || member.title || (member.fieldsOfExpertise || []).join(' · ');
  text.append(name, detail);
  link.append(avatarElement(member), text);
  item.append(link);
  if (action) item.append(action);
  return item;
};

export const followButton = (member: any, isFollowing: () => boolean, toggle: (on: boolean) => Promise<boolean>) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'profile-editor-text-button';
  const label = () => { button.textContent = isFollowing() ? 'Po e ndjek ✓' : 'Ndiq +'; };
  label();
  button.addEventListener('click', async () => {
    button.disabled = true;
    await toggle(!isFollowing());
    button.disabled = false;
    label();
  });
  return button;
};

export const fillList = (id: string, items: HTMLElement[], emptyText: string) => {
  const list = document.querySelector<HTMLElement>(`#${id}`)!;
  if (items.length) return list.replaceChildren(...items);
  const empty = document.createElement('li');
  empty.className = 'network-people-empty';
  empty.textContent = emptyText;
  list.replaceChildren(empty);
};

export const networkGraphStyles: any[] = [
  { selector: 'node', style: { label: 'data(label)', 'font-family': 'Inter, sans-serif', 'font-size': 8, 'text-wrap': 'wrap', 'text-max-width': '80px', 'text-valign': 'bottom', 'text-margin-y': 6, color: '#505158', 'min-zoomed-font-size': 6, 'background-color': '#d9c9d2', 'border-width': 1.5, 'border-color': '#b58ca1', width: 14, height: 14 } },
  { selector: 'node.is-following', style: { 'background-color': '#744761', 'border-color': '#5d374d', width: 17, height: 17, color: '#5d374d', 'font-weight': 700 } },
  { selector: 'node[type="me"]', style: { 'background-color': '#2d2630', 'border-width': 4, 'border-color': '#e1bdcf', width: 46, height: 46, 'font-size': 13, 'font-weight': 800, color: '#17181d', 'text-margin-y': 8 } },
  { selector: 'node[type="city"]', style: { 'background-color': '#293f52', 'border-width': 0, shape: 'diamond', width: 38, height: 38, 'font-size': 11, 'font-weight': 700, color: '#293f52' } },
  { selector: 'node[type="field"]', style: { 'background-color': '#b58ca1', 'border-width': 0, shape: 'round-rectangle', width: 44, height: 26, 'font-size': 11, 'font-weight': 700, color: '#744761' } },
  { selector: 'edge', style: { width: .9, 'line-color': '#c8bdc3', 'curve-style': 'bezier', opacity: .6 } },
  { selector: 'edge[source="me"]', style: { width: 2.2, 'line-color': '#b58ca1', opacity: .9 } },
  { selector: 'edge.direct', style: { 'line-style': 'dashed', 'line-color': '#744761', opacity: .55 } },
  { selector: 'node[type="group"]', style: { shape: 'round-rectangle', 'background-color': '#f3edf0', 'background-opacity': .75, 'border-width': 1, 'border-style': 'dashed', 'border-color': '#c9aebc', padding: '16px', 'text-valign': 'top', 'text-halign': 'center', 'text-margin-y': -6, 'font-size': 11, 'font-weight': 700, color: '#744761', 'text-max-width': '220px' } },
  { selector: 'edge[target^="city:"], edge[target^="field:"]', style: { width: 1.6, 'line-color': '#c9aebc', opacity: .8 } },
  { selector: '.faded', style: { opacity: .12 } },
  { selector: 'node.focused', style: { 'border-width': 4, 'border-color': '#e1bdcf', 'z-index': 10 } },
];
