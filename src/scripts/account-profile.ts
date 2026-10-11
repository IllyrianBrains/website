import { createClient } from '@supabase/supabase-js';
  import { memberSession } from './member-session';
  import { createProfileEntries, educationFields, experienceFields, openProfileEntry, profileEntryProblem, readProfileEntries } from './profile-entries';
  import { tagInput, loadTagSuggestions } from './tag-input';

  const root = document.querySelector<HTMLElement>('#profile-editor')!;
  const statusLine = document.querySelector<HTMLElement>('#editor-status')!;
  const say = (text: string, kind = '') => { statusLine.textContent = text; statusLine.dataset.kind = kind; };

  const loginForm = document.querySelector<HTMLFormElement>('#login-form')!;
  const noProfile = document.querySelector<HTMLElement>('#no-profile')!;
  const form = document.querySelector<HTMLFormElement>('#profile-form')!;
  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;

  // ── Unsaved changes ──
  let dirty = false;
  const dirtyNote = document.querySelector<HTMLElement>('#dirty-note')!;
  const setDirty = (value: boolean) => { dirty = value; dirtyNote.hidden = !value; };
  window.addEventListener('beforeunload', event => { if (dirty) event.preventDefault(); });
  const changed = () => { setDirty(true); updateStrength(); drawIntro(); };
  // The member picker and the photo input aren't profile edits themselves.
  const isProfileField = (target: EventTarget | null) => !['member'].includes((target as HTMLInputElement)?.name) && (target as HTMLElement)?.id !== 'photo-input';
  form.addEventListener('input', event => { if (isProfileField(event.target)) changed(); });
  form.addEventListener('change', event => { if (isProfileField(event.target)) changed(); });
  // The browser can't show a validation message inside a closed group, so open it first.
  form.addEventListener('invalid', event => { const group = (event.target as HTMLElement).closest('details'); if (group) group.open = true; }, true);

  // ── Tag inputs (skills, languages) ──
  const tags = {
    skills: tagInput(form.querySelector<HTMLElement>('[data-tags="skills"]')!, changed),
    languages: tagInput(form.querySelector<HTMLElement>('[data-tags="languages"]')!, changed),
  };

  const experienceRows = document.querySelector<HTMLElement>('#experience-rows')!;
  const educationRows = document.querySelector<HTMLElement>('#education-rows')!;
  const entries = createProfileEntries(changed);
  document.querySelector('#add-experience')!.addEventListener('click', () => entries.addBlank(experienceRows, experienceFields));
  document.querySelector('#add-education')!.addEventListener('click', () => entries.addBlank(educationRows, educationFields));

  // ── LinkedIn PDF import ──
  // An n8n workflow (outside this repo) turns the uploaded PDF into this JSON
  // shape and nothing else — no Supabase credentials involved on its side.
  function applyLinkedinImport(json: any) {
    if (json.headline && !field('headline').value.trim()) field('headline').value = json.headline;
    if (json.company && !field('company').value.trim()) field('company').value = json.company;
    if (json.about && !field('about').value.trim()) field('about').value = json.about;
    const current = tags.skills.peek();
    const next = (json.skills || []).filter((skill: string) => !current.some((existing: string) => existing.toLowerCase() === skill.toLowerCase()));
    if (next.length) tags.skills.set([...current, ...next]);
    (json.experience || []).forEach((row: any) => entries.add(experienceRows, experienceFields, row));
    (json.education || []).forEach((row: any) => entries.add(educationRows, educationFields, row));
  }

  // ── Profile strength ──
  const strengthChecks: [string, string, () => boolean][] = [
    ['Foto', 'section-intro', () => Boolean(avatar)],
    ['Titulli', 'section-basics', () => Boolean(field('headline').value.trim())],
    ['Kompania', 'section-basics', () => Boolean(field('company').value.trim())],
    ['Qyteti dhe shteti', 'section-basics', () => Boolean(field('city').value.trim() && field('country').value.trim())],
    ['Rreth meje (2–3 fjali)', 'section-about', () => field('about').value.trim().length >= 80],
    ['Fushat e ekspertizës', 'section-categories', () => Boolean(form.querySelector('#categories input:checked'))],
    ['Aspiratat e karrierës', 'section-aspirations', () => Boolean(field('aspiration_field').value)],
    ['Të paktën 3 aftësi', 'section-skills', () => tags.skills.peek().length >= 3],
    ['Gjuhët', 'section-languages', () => tags.languages.peek().length > 0],
    ['LinkedIn', 'section-links', () => Boolean(field('linkedin_url').value.trim())],
    ['Eksperienca', 'section-experience', () => experienceRows.children.length > 0],
    ['Arsimimi', 'section-education', () => educationRows.children.length > 0],
  ];
  let lastMissing = '';
  function updateStrength() {
    const missing = strengthChecks.filter(([, , done]) => !done());
    // Redraw only when something changed: a blur-triggered redraw would
    // otherwise swap out the button the user is in the middle of clicking.
    const key = missing.map(([label]) => label).join('|');
    if (key === lastMissing && document.querySelector('#strength-percent')!.textContent) return;
    lastMissing = key;
    const percent = Math.round(100 * (1 - missing.length / strengthChecks.length));
    document.querySelector<HTMLElement>('#strength-percent')!.textContent = `${percent}%`;
    document.querySelector<HTMLElement>('#strength-fill')!.style.width = `${percent}%`;
    const box = document.querySelector<HTMLElement>('#strength-missing')!;
    if (!missing.length) { box.textContent = 'Profili është i plotë. Faleminderit!'; return; }
    const intro = document.createElement('span');
    intro.textContent = 'Shto:';
    box.replaceChildren(intro, ...missing.map(([label, sectionId]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `+ ${label}`;
      button.addEventListener('click', () => {
        const section = document.getElementById(sectionId)!;
        const group = section.closest('details');
        if (group) group.open = true;
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        section.querySelector<HTMLElement>('input:not([type="file"]), textarea, .profile-card-add')?.focus({ preventScroll: true });
      });
      return button;
    }));
  }

  // ── Career aspirations ──
  const checkedValues = (name: string) => [...form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`)].map(input => input.value);
  const setChecked = (name: string, values: string[]) => form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`).forEach(input => { input.checked = values.includes(input.value); });
  // "Ku?" only matters when a return is on the cards (or they already live there).
  const drawReturnCountries = () => { document.querySelector<HTMLElement>('#return-countries')!.hidden = !['po', 'ndoshta', 'atje'].includes(checkedValues('return_plan')[0]); };
  form.querySelectorAll('input[name="return_plan"]').forEach(input => input.addEventListener('change', drawReturnCountries));

  // ── Photo ──
  let avatar: string | null = null;
  const photoPreview = document.querySelector<HTMLImageElement>('#photo-preview')!;
  const photoFallback = document.querySelector<HTMLElement>('#photo-fallback')!;
  const drawPhoto = () => {
    photoPreview.hidden = !avatar;
    photoFallback.hidden = Boolean(avatar);
    if (avatar) photoPreview.src = avatar;
    photoFallback.textContent = field('name').value.split(' ').map(part => part[0] || '').join('').slice(0, 2).toUpperCase();
  };
  // Live preview of the intro card, the way the name block looks in the directory.
  function drawIntro() {
    const text = (id: string, content: string) => { document.getElementById(id)!.textContent = content; };
    const place = [field('city').value.trim(), field('country').value.trim()].filter(Boolean).join(', ');
    text('preview-name', field('name').value.trim() || 'Emri yt');
    text('preview-headline', field('headline').value.trim());
    text('preview-meta', [field('company').value.trim(), place].filter(Boolean).join(' · '));
  }
  // Crops photos to a square (a bit above centre on portrait shots, where
  // faces usually are), scales to at most 600px and re-encodes as JPEG.
  const shrink = async (file: File) => {
    const bitmap = await createImageBitmap(file);
    const side = Math.min(bitmap.width, bitmap.height);
    const size = Math.min(600, side);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    canvas.getContext('2d')!.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) * 0.3, side, side, 0, 0, size, size);
    return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Fotoja nuk u lexua.'))), 'image/jpeg', 0.85));
  };

  const normalizeUrl = (value: string) => {
    const trimmed = value.trim();
    return trimmed && !/^https?:\/\//i.test(trimmed) ? `https://${trimmed}` : trimmed;
  };

  const url = root.dataset.supabaseUrl, key = root.dataset.supabaseKey;
  const linkedinWebhookUrl = root.dataset.linkedinImportWebhookUrl || '';
  document.querySelector<HTMLElement>('#section-linkedin-import')!.hidden = !linkedinWebhookUrl;
  if (!url || !key) say('Editimi i profileve nuk është konfiguruar ende.', 'error');
  else start(createClient(url, key));

  async function start(supabase: ReturnType<typeof createClient>) {
    document.querySelectorAll('[data-sign-out]').forEach(button => button.addEventListener('click', async () => {
      await supabase.auth.signOut();
      location.reload();
    }));

    loginForm.addEventListener('submit', async event => {
      event.preventDefault();
      const email = (loginForm.elements.namedItem('email') as HTMLInputElement).value.trim();
      const button = loginForm.querySelector('button')!;
      button.disabled = true;
      // The link in the email always opens the live site (illyrianbrains.org); only `npm run dev`
      // keeps the local address, so signing in can be tested locally.
      const siteOrigin = import.meta.env.DEV ? location.origin : root.dataset.site || location.origin;
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: siteOrigin + location.pathname } });
      button.disabled = false;
      if (error && /rate limit/i.test(error.message)) say('Janë dërguar shumë linqe hyrjeje brenda një ore. Prit pak dhe provo sërish, ose përdor linkun e fundit që ke marrë.', 'error');
      else if (error) say(`Linku nuk u dërgua: ${error.message}`, 'error');
      else say(`Të dërguam një link te ${email}. Hape nga ky shfletues për të hyrë.`, 'ok');
    });

    const linkError = new URLSearchParams(location.hash.slice(1)).get('error_description');
    const { session, expired } = await memberSession(supabase);
    if (!session) {
      if (linkError) say(`Linku nuk funksionoi (${linkError}). Kërko një link të ri.`, 'error');
      else if (expired) say('Sesioni yt ka skaduar. Hyr sërish.', 'error');
      // Signed out: same centered layout as /anetaresohu/regjistrohu/.
      root.classList.add('auth-shell');
      document.querySelector<HTMLElement>('#signin-intro')!.hidden = false;
      loginForm.hidden = false;
      return;
    }

    const email = session.user.email || '';
    const [{ data: isAdmin }, { data: categories }, { data: members, error: membersError }] = await Promise.all([
      supabase.rpc('is_admin'),
      supabase.from('categories').select('name').order('sort_order').order('name'),
      supabase.from('members').select('id, username, name, email, status').order('name'),
    ]);
    loadTagSuggestions(url!, { apikey: key!, ...(key!.startsWith('eyJ') && { Authorization: `Bearer ${key}` }) })
      .then(suggestions => { tags.skills.suggest(suggestions.skills); tags.languages.suggest(suggestions.languages); })
      .catch(() => {});
    if (membersError) return say(`Profili nuk u ngarkua: ${membersError.message}`, 'error');
    if (!members?.length) {
      document.querySelector('#no-profile-email')!.textContent = email;
      root.classList.add('auth-shell');
      noProfile.hidden = false;
      return;
    }

    document.querySelector('#signed-in-as')!.textContent = email;
    const categoryBox = document.querySelector<HTMLElement>('#categories')!;
    (categories || []).forEach(({ name }: { name: string }) => {
      const label = document.createElement('label');
      label.className = 'profile-editor-chip';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'fields_of_expertise';
      input.value = name;
      label.append(input, ` ${name}`);
      categoryBox.append(label);
      field('aspiration_field').append(new Option(name, name));
    });

    const picker = field('member') as unknown as HTMLSelectElement;
    if (isAdmin) {
      document.querySelector<HTMLElement>('#admin-picker')!.hidden = false;
      document.querySelector<HTMLElement>('#admin-fields')!.hidden = false;
      // Pending registrations first, so new people are easy to find and approve.
      [...members].sort((a: any, b: any) => Number(a.status === 'ok') - Number(b.status === 'ok'))
        .forEach((member: any) => picker.append(new Option(`${member.status === 'ok' ? '' : '⏳ '}${member.name} (@${member.username})${member.status === 'ok' ? '' : ' — në pritje'}`, String(member.id))));
    }
    const own = members.find((member: any) => (member.email || '').toLowerCase() === email.toLowerCase());
    const requested = members.find((member: any) => member.username === new URLSearchParams(location.search).get('u'));
    let memberId: number = (isAdmin && requested ? requested : own || members[0]).id;
    picker.value = String(memberId);

    const load = async (id: number) => {
      say('Duke ngarkuar…');
      const { data: member, error } = await supabase.from('members').select(`
        id, username, name, email, status, headline, company, experience_level,
        city, country, about, website, linkedin_url, fields_of_expertise, skills,
        languages, avatar, aspiration_field, aspiration_subfield, aspirations_note,
        mentoring_interests, business_interests, return_plan, return_countries,
        member_experience(id, title, organization, location, start_year, end_year, is_current, description, sort_order),
        member_education(id, school, degree, field, start_year, end_year, sort_order)
      `).eq('id', id).single();
      if (error || !member) return say(`Profili nuk u ngarkua: ${error?.message}`, 'error');
      memberId = id;
      ['name', 'headline', 'company', 'experience_level', 'city', 'country', 'about', 'website', 'linkedin_url'].forEach(name => { field(name).value = member[name] || ''; });
      (field('status') as unknown as HTMLSelectElement).value = member.status;
      categoryBox.querySelectorAll<HTMLInputElement>('input').forEach(input => { input.checked = member.fields_of_expertise.includes(input.value); });
      const unknown = member.fields_of_expertise.filter((name: string) => !(categories || []).some((category: any) => category.name === name));
      if (unknown.length) say(`Kujdes: kategoritë ${unknown.join(', ')} nuk janë më në listë dhe do të hiqen kur ruan.`, 'error');
      else say('');
      tags.skills.set(member.skills);
      tags.languages.set(member.languages);
      field('aspiration_field').value = member.aspiration_field || '';
      field('aspiration_subfield').value = member.aspiration_subfield || '';
      field('aspirations_note').value = member.aspirations_note || '';
      const aspirationAliases: Record<string, string> = {
        'Kërkoj mentor': 'Lidhje me një mentor', 'Këshilla për karrierën': 'Këshillim për karrierën', 'Dua të jem mentor': 'Mundësi për të mentoruar',
        'Kërkoj bashkëthemelues': 'Prezantim me bashkëthemelues', 'Kërkoj klientë / partnerë': 'Prezantim me klientë / partnerë', 'Kërkoj punë': 'Mundësi pune',
        'Punësoj': 'Kandidatë për punësim', 'Kërkoj investim': 'Financim për projekt / biznes', 'Dua të investoj': 'Mundësi investimi',
      };
      setChecked('mentoring_interests', (member.mentoring_interests || []).map((value: string) => aspirationAliases[value] || value));
      setChecked('business_interests', (member.business_interests || []).map((value: string) => aspirationAliases[value] || value));
      setChecked('return_plan', member.return_plan ? [member.return_plan] : []);
      setChecked('return_countries', member.return_countries || []);
      drawReturnCountries();
      document.querySelector<HTMLElement>('#pending-notice')!.hidden = member.status === 'ok';
      experienceRows.replaceChildren();
      educationRows.replaceChildren();
      [...member.member_experience].sort((a: any, b: any) => a.sort_order - b.sort_order).forEach((row: any) => entries.add(experienceRows, experienceFields, row));
      [...member.member_education].sort((a: any, b: any) => a.sort_order - b.sort_order).forEach((row: any) => entries.add(educationRows, educationFields, row));
      avatar = member.avatar;
      drawPhoto();
      drawIntro();
      document.querySelector<HTMLAnchorElement>('#view-profile')!.href = `/anetaret/?search=${encodeURIComponent(member.username)}`;
      form.hidden = false;
      setDirty(false);
      updateStrength();
    };
    picker.addEventListener('change', () => {
      if (dirty && !confirm('Ke ndryshime të paruajtura në këtë profil. Të kalosh te tjetri pa i ruajtur?')) {
        picker.value = String(memberId);
        return;
      }
      load(Number(picker.value));
    });
    field('name').addEventListener('input', drawPhoto);

    document.querySelector<HTMLInputElement>('#photo-input')!.addEventListener('change', async event => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      input.value = '';
      if (!file) return;
      try {
        say('Duke ngarkuar foton…');
        const { data, error } = await supabase.storage.from('avatars').upload(`${session.user.id}/${Date.now()}.jpg`, await shrink(file), { contentType: 'image/jpeg' });
        if (error) throw error;
        avatar = supabase.storage.from('avatars').getPublicUrl(data.path).data.publicUrl;
        drawPhoto();
        changed();
        say('Fotoja u ngarkua — kliko “Ruaj ndryshimet” për ta publikuar.', 'ok');
      } catch (error: any) {
        say(`Fotoja nuk u ngarkua: ${error.message}`, 'error');
      }
    });
    document.querySelector('#photo-remove')!.addEventListener('click', () => { avatar = null; drawPhoto(); changed(); });

    document.querySelector<HTMLInputElement>('#linkedin-pdf-input')!.addEventListener('change', async event => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      input.value = '';
      if (!file) return;
      if (file.type !== 'application/pdf') return say('Zgjidh një skedar PDF.', 'error');
      if (file.size > 10 * 1024 * 1024) return say('PDF-ja është shumë e madhe (maksimumi 10MB).', 'error');
      try {
        say('Duke lexuar PDF-në e LinkedIn…');
        const body = new FormData();
        body.append('file', file);
        const response = await fetch(linkedinWebhookUrl, { method: 'POST', body });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        applyLinkedinImport(await response.json());
        changed();
        say('Të dhënat u importuan nga LinkedIn — kontrolloji dhe kliko “Ruaj ndryshimet”.', 'ok');
      } catch (error: any) {
        say(`Importimi nga LinkedIn dështoi: ${error.message}`, 'error');
      }
    });

    document.querySelector<HTMLButtonElement>('#export-data')!.addEventListener('click', async () => {
      const { data, error } = await supabase.rpc('my_data_export');
      if (error || !data) return say(`Të dhënat nuk u shkarkuan: ${error?.message || 'nuk u gjetën'}`, 'error');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      link.download = 'illyrian-brains-te-dhenat-e-mia.json';
      link.click();
      URL.revokeObjectURL(link.href);
    });
    document.querySelector<HTMLButtonElement>('#deactivate-account')!.addEventListener('click', async () => {
      if (!confirm('Ta fshehim profilin tënd publik? Të dhënat ruhen dhe ekipi mund ta riaktivizojë.')) return;
      const { error } = await supabase.rpc('deactivate_my_membership');
      if (error) return say(`Profili nuk u çaktivizua: ${error.message}`, 'error');
      await supabase.auth.signOut();
      location.reload();
    });

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const problem = profileEntryProblem(experienceRows, 'Eksperienca', 'title', 'Pozicioni') || profileEntryProblem(educationRows, 'Arsimimi', 'school', 'Shkolla / universiteti');
      if (!field('name').value.trim()) {
        say('Emri nuk mund të jetë bosh.', 'error');
        field('name').closest('details')!.open = true;
        field('name').focus();
        return;
      }
      if (problem) {
        problem[0].closest('details')!.open = true;
        openProfileEntry(problem[0].closest('.profile-editor-row')!);
        say(problem[1], 'error');
        problem[0].focus();
        return;
      }
      const profile: Record<string, unknown> = {
        ...Object.fromEntries(['name', 'headline', 'company', 'city', 'country', 'about'].map(name => [name, field(name).value.trim()])),
        website: normalizeUrl(field('website').value),
        linkedin_url: normalizeUrl(field('linkedin_url').value),
        fields_of_expertise: [...categoryBox.querySelectorAll<HTMLInputElement>('input:checked')].map(input => input.value),
        skills: tags.skills.get(),
        languages: tags.languages.get(),
        avatar,
      };
      if (isAdmin) profile.status = (field('status') as unknown as HTMLSelectElement).value;
      const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
      button.disabled = true;
      say('Duke ruajtur…');
      const { error: profileError } = await supabase.rpc('save_member_profile', {
        p_member_id: memberId,
        p_profile: profile,
        p_experience: readProfileEntries(experienceRows),
        p_education: readProfileEntries(educationRows),
      });
      let error = profileError;
      if (!error) ({ error } = await supabase.rpc('save_member_aspirations', {
        p_member_id: memberId,
        p: {
          aspiration_field: field('aspiration_field').value,
          aspiration_subfield: field('aspiration_subfield').value.trim(),
          aspirations_note: field('aspirations_note').value.trim(),
          mentoring_interests: checkedValues('mentoring_interests'),
          business_interests: checkedValues('business_interests'),
          return_plan: checkedValues('return_plan')[0] || '',
          return_countries: checkedValues('return_countries'),
        },
      }));
      if (!error) ({ error } = await supabase.rpc('save_member_experience_level', {
        p_member_id: memberId,
        p_level: field('experience_level').value,
      }));
      button.disabled = false;
      if (error) say(`Nuk u ruajt: ${error.message}`, 'error');
      else {
        await load(memberId);
        say('U ruajt! Ndryshimet shfaqen menjëherë në drejtorinë e anëtarëve.', 'ok');
      }
    });

    await load(memberId);
  }
