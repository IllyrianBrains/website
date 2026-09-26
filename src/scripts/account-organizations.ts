import { createClient } from '@supabase/supabase-js';
  import { memberSession } from './member-session';

  const root = document.querySelector<HTMLElement>('#orgs')!;
  const labels = JSON.parse(root.dataset.labels!) as { category: Record<string, string>; stage: Record<string, string>; add: string; all: string; empty: string };
  const statusLine = document.querySelector<HTMLElement>('#orgs-status')!;
  const say = (text: string, kind = '') => { statusLine.textContent = text; statusLine.dataset.kind = kind; };
  const list = document.querySelector<HTMLElement>('#org-list')!;
  const form = document.querySelector<HTMLFormElement>('#org-form')!;
  const filter = document.querySelector<HTMLSelectElement>('#status-filter')!;
  const submit = document.querySelector<HTMLButtonElement>('#org-submit')!;
  const addButton = document.querySelector<HTMLButtonElement>('#org-add')!;
  const cancel = document.querySelector<HTMLButtonElement>('#edit-cancel')!;
  const logoPreview = document.querySelector<HTMLImageElement>('#logo-preview')!;
  const logoRemove = document.querySelector<HTMLButtonElement>('#logo-remove')!;
  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
  const categoryBoxes = [...form.querySelectorAll<HTMLInputElement>('input[name="categories"]')];
  const kindField = field('kind') as unknown as HTMLSelectElement;
  const currentKind = () => kindField.value as 'ngo' | 'business';
  const drawKind = () => {
    form.querySelectorAll<HTMLElement>('[data-categories-for]').forEach(group => { group.hidden = group.dataset.categoriesFor !== currentKind(); });
    document.querySelector<HTMLElement>('#org-stage')!.hidden = currentKind() !== 'business';
  };
  kindField.addEventListener('change', () => { categoryBoxes.forEach(box => { box.checked = false; }); drawKind(); });
  drawKind();
  const stateLabel: Record<string, string> = { pending: 'Në shqyrtim', published: 'Publikuar', hidden: 'Jo publike' };
  // Small DOM helper: member text only ever goes in through textContent.
  const el = (tag: string, className = '', text = '') => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const button = (text: string, onClick: () => void, className = 'profile-editor-text-button') => {
    const node = el('button', className, text) as HTMLButtonElement;
    node.type = 'button';
    node.addEventListener('click', onClick);
    return node;
  };
  const normalizeUrl = (value: string) => {
    const trimmed = value.trim();
    return trimmed && !/^https?:\/\//i.test(trimmed) ? `https://${trimmed}` : trimmed;
  };

  // The main category (`category`) is the first ticked in list order, the rest go to `other_categories`.
  const itemCategories = (item: any): string[] => [item.category, ...(item.other_categories || [])];

  // ── Logo ── (same bucket as profile photos; kept whole, not cropped)
  let logo: string | null = null;
  const drawLogo = () => {
    logoPreview.hidden = logoRemove.hidden = !logo;
    if (logo) logoPreview.src = logo;
  };
  logoRemove.addEventListener('click', () => { logo = null; drawLogo(); });
  // Scales to fit 400px and re-encodes as PNG, so transparent logos stay transparent.
  const shrink = async (file: File) => {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Logoja nuk u lexua.'))), 'image/png'));
  };

  const resetForm = (hide = true) => {
    form.reset();
    logo = null;
    drawLogo();
    document.querySelector('#form-title')!.textContent = labels.add;
    submit.firstChild!.textContent = 'Dërgo për shqyrtim ';
    cancel.hidden = true;
    drawKind();
    form.hidden = hide;
  };
  cancel.addEventListener('click', () => resetForm());
  addButton.addEventListener('click', () => { resetForm(false); form.scrollIntoView({ behavior: 'smooth', block: 'start' }); });

  const url = root.dataset.supabaseUrl, key = root.dataset.supabaseKey;
  if (!url || !key) say('Kjo faqe nuk është konfiguruar ende.', 'error');
  else start(createClient(url, key));

  async function start(supabase: ReturnType<typeof createClient>) {
    const { session } = await memberSession(supabase);
    if (!session) {
      document.querySelector<HTMLElement>('#signed-out')!.hidden = false;
      return;
    }
    const { data: isAdmin } = await supabase.rpc('is_admin');
    let assignableMembers: any[] = [];
    if (isAdmin) {
      const { data } = await supabase.from('members').select('id,name,username,email,status').order('name');
      assignableMembers = data || [];
      document.querySelector<HTMLElement>('#status-filter-wrap')!.hidden = false;
    }
    document.querySelector<HTMLElement>('#signed-in')!.hidden = false;
    document.querySelector<HTMLElement>('#offers-workspace')!.hidden = false;

    document.querySelector<HTMLInputElement>('#logo-input')!.addEventListener('change', async event => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      input.value = '';
      if (!file) return;
      say('Duke ngarkuar logon…');
      try {
        const { data, error } = await supabase.storage.from('avatars').upload(`${session.user.id}/logo-${Date.now()}.png`, await shrink(file), { contentType: 'image/png' });
        if (error) throw error;
        logo = supabase.storage.from('avatars').getPublicUrl(data.path).data.publicUrl;
        drawLogo();
        say('');
      } catch (error: any) {
        say(`Logoja nuk u ngarkua: ${error.message}`, 'error');
      }
    });

    const run = async (call: PromiseLike<{ error: { message: string } | null }>, done: string) => {
      const { error } = await call;
      if (error) say(`Nuk u krye: ${error.message}`, 'error');
      else { say(done, 'ok'); load(); }
    };

    const card = (item: any, editable = true) => {
      const article = el('article', `org-card org-card--${item.kind}`);
      const head = el('div', 'org-card-head');
      if (item.logo) {
        const image = el('img', 'org-card-logo') as HTMLImageElement;
        image.src = item.logo;
        image.alt = '';
        head.append(image);
      } else head.append(el('span', 'org-card-logo org-card-logo--empty', item.name.trim().charAt(0).toUpperCase()));
      const titles = el('div');
      const badges = el('div', 'org-card-badges');
      badges.append(el('span', 'org-kind', item.kind === 'ngo' ? 'OJF' : 'Biznes'), el('span', `org-status org-status--${item.status}`, stateLabel[item.status]));
      const title = el('h3');
      if (editable) {
        const link = el('a', '', item.name) as HTMLAnchorElement;
        link.href = `/anetaresohu/perfaqesimi/subjekti/?id=${item.id}`;
        title.append(link);
      } else if (item.status === 'published') {
        const link = el('a', '', item.name) as HTMLAnchorElement;
        link.href = item.kind === 'ngo' ? '/shoqatat/' : '/bizneset/';
        title.append(link);
      } else title.textContent = item.name;
      titles.append(badges, title);
      head.append(titles);
      article.append(head);
      const meta = [
        [...new Set(itemCategories(item))].map(category => labels.category[category] || category).join(', '),
        item.stage ? labels.stage[item.stage] : '',
        [item.city, item.country].filter(Boolean).join(', '),
        isAdmin && item.members ? `${item.members.name} (@${item.members.username})` : '',
      ].filter(Boolean).join(' · ');
      article.append(el('p', 'org-meta', meta));
      if (item.description) article.append(el('p', 'org-description', item.description));
      const links = [item.website, item.linkedin, item.instagram].filter(Boolean);
      if (links.length) {
        const row = el('p', 'org-links');
        links.forEach(href => {
          const link = el('a', '', href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')) as HTMLAnchorElement;
          link.href = href;
          link.target = '_blank';
          link.rel = 'noopener';
          row.append(link);
        });
        article.append(row);
      }

      if (!isAdmin && editable && item.admin_note) {
        const reply = el('div', 'org-reply');
        reply.append(el('strong', '', 'Përgjigja e ekipit'), el('p', '', item.admin_note));
        article.append(reply);
      }

      if (editable) {
        const actions = el('div', 'org-actions');
        const manage = el('a', 'org-action', 'Menaxho profilin →') as HTMLAnchorElement;
        manage.href = `/anetaresohu/perfaqesimi/subjekti/?id=${item.id}`;
        actions.append(manage);
        article.append(actions);
      }
      return article;
    };

    async function load() {
      let query = supabase.from('organizations').select('*, members!organizations_member_id_fkey(name, username)').order('created_at', { ascending: false });
      if (isAdmin && filter.value) query = query.eq('status', filter.value);
      const [{ data, error }, { data: representatives }] = await Promise.all([
        query,
        isAdmin ? supabase.from('organization_representatives').select('organization_id,member_id') : Promise.resolve({ data: [] }),
      ]);
      if (error) return say(`Nuk u ngarkuan: ${error.message}`, 'error');
      const ownMember = assignableMembers.find(member => (member.email || '').toLowerCase() === (session.user.email || '').toLowerCase());
      const represented = new Set((representatives || []).filter((row: any) => Number(row.member_id) === Number(ownMember?.id)).map((row: any) => Number(row.organization_id)));
      const managed = isAdmin ? (data || []).filter((item: any) => Number(item.member_id) === Number(ownMember?.id) || represented.has(Number(item.id))) : data || [];
      document.querySelector('#org-count')!.textContent = managed.length ? String(managed.length) : '';
      if (!managed.length) list.replaceChildren(el('p', 'org-empty', isAdmin && filter.value ? 'Asnjë nga subjektet e tua nuk ka këtë status.' : labels.empty));
      else list.replaceChildren(...managed.map(card));
    }
    filter.addEventListener('change', load);

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const value = (name: string) => field(name).value.trim();
      const kind = currentKind();
      const categories = categoryBoxes.filter(box => !box.closest<HTMLElement>('[data-categories-for]')!.hidden && box.checked).map(box => box.value);
      if (!form.checkValidity()) return form.reportValidity();
      if (!categories.length) return say('Zgjidh të paktën një kategori.', 'error');
      submit.disabled = true;
      say('Duke dërguar…');
      const { data: savedId, error } = await supabase.rpc('save_organization', { p_id: null, p: {
        kind, name: value('name'), category: categories[0], categories, stage: kind === 'business' ? value('stage') : null,
        city: value('city'), country: value('country'), description: value('description'),
        website: normalizeUrl(value('website')), linkedin: normalizeUrl(value('linkedin')), instagram: normalizeUrl(value('instagram')),
        logo,
      } });
      submit.disabled = false;
      if (error) return say(`Nuk u dërgua: ${error.message}`, 'error');
      if (savedId) {
        location.href = `/anetaresohu/perfaqesimi/subjekti/?id=${savedId}`;
        return;
      }
      say(isAdmin ? 'U ruajt.' : 'Faleminderit! Ekipi i IB do ta shqyrtojë dhe do të dalë në drejtori pas miratimit.', 'ok');
      resetForm();
      load();
    });

    const offerForm = document.querySelector<HTMLFormElement>('#offer-form')!;
    const offerList = document.querySelector<HTMLElement>('#offers-list')!;
    const offerOrganization = document.querySelector<HTMLSelectElement>('#offer-organization')!;
    const offerSubmit = offerForm.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    let editingOfferId: number | null = null;
    const offerKindLabels: Record<string, string> = { job: 'Vend pune', internship: 'Praktikë', event: 'Event', project: 'Projekt', volunteer: 'Vullnetarë', benefit: 'Përfitim / kupon', collaboration: 'Bashkëpunim' };
    async function loadOffers() {
      const [{ data: organizations }, { data: offers, error }] = await Promise.all([
        supabase.from('organizations').select('id,name,status').order('name'),
        supabase.from('organization_offers').select('*, organizations(name)').order('created_at', { ascending: false }),
      ]);
      const selected = offerOrganization.value;
      offerOrganization.replaceChildren(new Option('Zgjidh subjektin', ''), ...(organizations || []).map((organization: any) => new Option(`${organization.name}${organization.status === 'published' ? '' : ' · në shqyrtim'}`, String(organization.id))));
      if ([...offerOrganization.options].some(option => option.value === selected)) offerOrganization.value = selected;
      if (error) { offerList.replaceChildren(el('p', 'org-empty', 'Ofertat aktivizohen pasi të ekzekutohet migrimi 015.')); return; }
      if (!offers?.length) { offerList.replaceChildren(el('p', 'org-empty', 'Ende nuk ke publikuar oferta.')); return; }
      offerList.replaceChildren(...offers.map((offer: any) => {
        const article = el('article', 'offer-card');
        const head = el('div', 'offer-card-head');
        const text = el('div'); text.append(el('span', 'org-kind', offerKindLabels[offer.kind] || offer.kind), el('h3', '', offer.title));
        head.append(text, el('span', `org-status org-status--${offer.status}`, stateLabel[offer.status]));
        article.append(head, el('p', 'org-meta', offer.organizations?.name || ''), el('p', 'org-description', offer.description));
        if (offer.expires_at) article.append(el('p', 'offer-deadline', `Afati: ${new Date(offer.expires_at).toLocaleDateString('sq-AL')}`));
        if (offer.url) { const link = el('a', 'offer-link', 'Hap ofertën ↗') as HTMLAnchorElement; link.href = offer.url; link.target = '_blank'; link.rel = 'noreferrer'; article.append(link); }
        const actions = el('div', 'org-actions');
        actions.append(button('Edito', () => {
          editingOfferId = offer.id;
          const set = (name: string, value: unknown) => { const input = offerForm.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null; if (input) input.value = String(value || ''); };
          set('organization_id', offer.organization_id); set('kind', offer.kind); set('title', offer.title); set('description', offer.description); set('url', offer.url); set('expires_at', offer.expires_at);
          offerSubmit.childNodes[0].textContent = 'Ruaj ndryshimet '; offerForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 'org-action'));
        actions.append(button('Hiq ofertën', () => { if (confirm(`Të hiqet “${offer.title}”?`)) run(supabase.rpc('delete_organization_offer', { p_id: offer.id }), 'Oferta u hoq.').then(loadOffers); }, 'org-action org-remove'));
        article.append(actions);
        return article;
      }));
    }
    offerForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (!offerForm.reportValidity()) return;
      const data = new FormData(offerForm);
      const value = (name: string) => String(data.get(name) || '').trim();
      const button = offerSubmit; button.disabled = true;
      const { error } = await supabase.rpc('save_organization_offer', { p_id: editingOfferId, p: { organization_id: value('organization_id'), kind: value('kind'), title: value('title'), description: value('description'), url: normalizeUrl(value('url')), expires_at: value('expires_at') } });
      button.disabled = false;
      if (error) return say(`Oferta nuk u publikua: ${error.message}`, 'error');
      const wasEditing = editingOfferId !== null; editingOfferId = null; offerForm.reset(); button.childNodes[0].textContent = 'Publiko ofertën '; say(wasEditing ? 'Ndryshimet u ruajtën.' : 'Oferta u publikua dhe ndjekësit e subjektit do të njoftohen.', 'ok'); loadOffers();
    });

    load();
    loadOffers();
  }
