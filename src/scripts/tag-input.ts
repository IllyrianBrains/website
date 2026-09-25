// Tag input shared by the profile edit page and the registration form: type a
// value and press Enter (or a comma) to add it; click a tag to remove it.
// Markup: <div class="profile-editor-tags" data-tags="skills"><input … /></div>

export interface TagInput {
  get: () => string[];      // commits any half-typed text first — use when saving
  peek: () => string[];     // current tags only, no side effects
  set: (values: string[]) => void;
  suggest: (options: string[]) => void;
}

export function tagInput(box: HTMLElement, onChange: () => void = () => {}): TagInput {
  const input = box.querySelector('input')!;
  let values: string[] = [];

  const draw = () => {
    box.querySelectorAll('.profile-editor-tag').forEach(tag => tag.remove());
    values.forEach((value, index) => {
      const tag = document.createElement('button');
      tag.type = 'button';
      tag.className = 'profile-editor-tag member-pill member-pill-specialty';
      tag.textContent = `${value} ✕`;
      tag.setAttribute('aria-label', `Hiq ${value}`);
      tag.addEventListener('click', () => { values.splice(index, 1); draw(); onChange(); });
      box.insertBefore(tag, input);
    });
  };
  const add = () => {
    const before = values.length;
    input.value.split(',').map(value => value.trim()).filter(Boolean).forEach(value => {
      if (!values.some(existing => existing.toLowerCase() === value.toLowerCase())) values.push(value);
    });
    input.value = '';
    if (values.length !== before) { draw(); onChange(); }
  };

  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); add(); }
    else if (event.key === 'Backspace' && !input.value && values.length) { values.pop(); draw(); onChange(); }
  });
  input.addEventListener('blur', add);
  // Picking an option from the suggestion list adds it straight away.
  input.addEventListener('input', event => { if (!(event as InputEvent).inputType || (event as InputEvent).inputType === 'insertReplacementText') add(); });

  return {
    get: () => { add(); return [...values]; },
    peek: () => [...values],
    set: next => { values = [...next]; draw(); },
    suggest: options => {
      const list = document.createElement('datalist');
      list.id = `${box.dataset.tags}-suggestions`;
      list.append(...options.map(option => new Option(option)));
      box.append(list);
      input.setAttribute('list', list.id);
    },
  };
}

// Skills and languages other members already use, most common first — offered
// as suggestions so people pick "Anglisht" instead of typing "anglisht".
export async function loadTagSuggestions(url: string, headers: Record<string, string>) {
  const response = await fetch(`${url}/rest/v1/public_member_profiles?select=skills,languages`, { headers });
  if (!response.ok) return { skills: [], languages: [] };
  const rows: { skills: string[]; languages: string[] }[] = await response.json();
  const rank = (lists: string[][]) => {
    const counts = new Map<string, { value: string; count: number }>();
    lists.flat().forEach(value => {
      const key = value.toLowerCase();
      const entry = counts.get(key) || { value, count: 0 };
      entry.count++;
      counts.set(key, entry);
    });
    return [...counts.values()].sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'sq')).map(entry => entry.value);
  };
  return { skills: rank(rows.map(row => row.skills || [])), languages: rank(rows.map(row => row.languages || [])) };
}
