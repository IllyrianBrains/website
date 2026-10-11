export const experienceFields = `<label>Pozicioni *<input data-key="title" maxlength="160" /></label><label>Organizata<input data-key="organization" maxlength="160" /></label><label>Vendndodhja<input data-key="location" maxlength="120" /></label><div class="profile-editor-years"><label>Nga viti<input data-key="start_year" type="number" min="1950" max="2100" /></label><label>Deri në vitin<input data-key="end_year" type="number" min="1950" max="2100" /></label><label class="profile-editor-check"><input data-key="is_current" type="checkbox" /> Punoj ende këtu</label></div><label class="profile-editor-wide">Përshkrimi<textarea data-key="description" rows="3" maxlength="2000"></textarea></label>`;
export const educationFields = `<label>Shkolla / universiteti *<input data-key="school" maxlength="160" /></label><label>Diploma<input data-key="degree" maxlength="80" placeholder="p.sh. MSc" /></label><label>Fusha e studimit<input data-key="field" maxlength="160" /></label><div class="profile-editor-years"><label>Nga viti<input data-key="start_year" type="number" min="1950" max="2100" /></label><label>Deri në vitin<input data-key="end_year" type="number" min="1950" max="2100" /></label></div>`;

const rowSummary = '<div class="profile-entry"><span class="profile-list-icon" data-summary="icon"></span><div class="profile-entry-text"><strong data-summary="title"></strong><span data-summary="sub"></span><small data-summary="meta"></small></div><div class="profile-editor-row-controls"><button type="button" data-move="-1" aria-label="Lëviz lart" title="Lëviz lart">↑</button><button type="button" data-move="1" aria-label="Lëviz poshtë" title="Lëviz poshtë">↓</button><button type="button" data-edit aria-label="Edito" title="Edito">✎</button><button type="button" data-remove aria-label="Hiq" title="Hiq">✕</button></div></div>';
const rowDone = '<div class="profile-editor-wide profile-entry-done"><button class="profile-editor-text-button" type="button" data-edit>Mbyll</button></div>';

export const openProfileEntry = (row: Element, open = true) => {
  row.classList.toggle('is-editing', open);
  row.querySelector('.profile-entry [data-edit]')!.setAttribute('aria-expanded', String(open));
};

const summarize = (row: Element) => {
  const value = (key: string) => row.querySelector<HTMLInputElement>(`[data-key="${key}"]`)?.value.trim() || '';
  const isEducation = Boolean(row.querySelector('[data-key="school"]'));
  const current = row.querySelector<HTMLInputElement>('[data-key="is_current"]')?.checked;
  const title = value(isEducation ? 'school' : 'title');
  const sub = (isEducation ? [value('degree'), value('field')] : [value('organization')]).filter(Boolean).join(', ');
  const years = [value('start_year'), current ? 'Tani' : value('end_year')].filter(Boolean).join(' – ');
  const text = (part: string, content: string) => { row.querySelector(`[data-summary="${part}"]`)!.textContent = content; };
  text('title', title || (isEducation ? 'Arsimim i ri' : 'Pozicion i ri'));
  text('sub', sub);
  text('meta', [years, value('location')].filter(Boolean).join(' · '));
  text('icon', ((isEducation ? value('school') : value('organization')) || title || '•')[0].toUpperCase());
};

export const createProfileEntries = (onChange: () => void) => {
  const add = (container: HTMLElement, fieldsHtml: string, values: Record<string, unknown> = {}) => {
    const row = document.createElement('div');
    row.className = 'profile-editor-row';
    row.innerHTML = `${rowSummary}<div class="profile-entry-form profile-editor-grid">${fieldsHtml}${rowDone}</div>`;
    row.querySelectorAll<HTMLInputElement>('[data-key]').forEach(input => {
      const value = values[input.dataset.key!];
      if (input.type === 'checkbox') input.checked = Boolean(value);
      else input.value = value == null ? '' : String(value);
    });
    const current = row.querySelector<HTMLInputElement>('[data-key="is_current"]');
    const end = row.querySelector<HTMLInputElement>('[data-key="end_year"]');
    const syncEnd = () => { if (current && end) { end.disabled = current.checked; if (current.checked) end.value = ''; } };
    current?.addEventListener('change', syncEnd);
    syncEnd();
    summarize(row);
    row.addEventListener('input', () => summarize(row));
    row.addEventListener('change', () => summarize(row));
    row.querySelectorAll('[data-edit]').forEach(button => button.addEventListener('click', () => openProfileEntry(row, !row.classList.contains('is-editing'))));
    row.querySelector('[data-remove]')!.addEventListener('click', () => { row.remove(); onChange(); });
    row.querySelectorAll<HTMLElement>('[data-move]').forEach(button => button.addEventListener('click', () => {
      if (button.dataset.move === '-1' && row.previousElementSibling) container.insertBefore(row, row.previousElementSibling);
      if (button.dataset.move === '1' && row.nextElementSibling) container.insertBefore(row.nextElementSibling, row);
      onChange();
    }));
    container.append(row);
    return row;
  };

  const addBlank = (container: HTMLElement, fieldsHtml: string) => {
    const row = add(container, fieldsHtml);
    openProfileEntry(row);
    row.querySelector<HTMLInputElement>('[data-key]')!.focus();
    onChange();
  };

  return { add, addBlank };
};

export const readProfileEntries = (container: HTMLElement) => [...container.children].map(row => Object.fromEntries(
  [...row.querySelectorAll<HTMLInputElement>('[data-key]')].map(input => [
    input.dataset.key!,
    input.type === 'checkbox' ? input.checked : input.type === 'number' ? (input.value ? Number(input.value) : null) : input.value.trim(),
  ]),
));

export const profileEntryProblem = (container: HTMLElement, label: string, requiredKey: string, requiredLabel: string): [HTMLInputElement, string] | null => {
  const thisYear = new Date().getFullYear();
  for (const row of container.children) {
    const input = (key: string) => row.querySelector<HTMLInputElement>(`[data-key="${key}"]`)!;
    const filled = [...row.querySelectorAll<HTMLInputElement>('[data-key]')].some(element => element.type === 'checkbox' ? element.checked : element.value.trim());
    if (filled && !input(requiredKey).value.trim()) return [input(requiredKey), `${label}: plotëso “${requiredLabel}” ose hiqe rreshtin.`];
    const start = Number(input('start_year').value) || 0;
    const end = Number(input('end_year').value) || 0;
    if (start && (start < 1950 || start > thisYear)) return [input('start_year'), `${label}: viti i fillimit duhet të jetë ndërmjet 1950 dhe ${thisYear}.`];
    if (start && end && end < start) return [input('end_year'), `${label}: viti i mbarimit është para vitit të fillimit.`];
  }
  return null;
};
