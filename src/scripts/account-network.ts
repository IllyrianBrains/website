import { createClient } from '@supabase/supabase-js';
  import cytoscape from 'cytoscape';
  import { memberSession } from './member-session';
  import { initials, memberUrl, postElement, relatedMembers, type MemberPost } from './members';
  const preview = (value: string, limit = 220) => { const text = (value || "").replaceAll(String.fromCharCode(10), " ").replaceAll(String.fromCharCode(9), " ").split(" ").filter(Boolean).join(" ").trim(); return text.length <= limit ? text : text.slice(0, limit - 1).trimEnd() + "…"; };

  const root = document.querySelector<HTMLElement>('#network')!;
  const statusLine = document.querySelector<HTMLElement>('#network-status')!;
  const say = (text: string, kind = '') => { statusLine.textContent = text; statusLine.dataset.kind = kind; };
  const url = root.dataset.supabaseUrl, key = root.dataset.supabaseKey;
  if (!url || !key) say('Kjo faqe nuk është konfiguruar ende.', 'error');
  else start(createClient(url, key));

  async function start(supabase: ReturnType<typeof createClient>) {
    const { session } = await memberSession(supabase);
    if (!session) {
      document.querySelector<HTMLElement>('#signed-out')!.hidden = false;
      return;
    }
    const [{ data: network, error }, { data: rows }, { data: subscriptions }, { data: categories }, { data: posts }, { data: ideas }, { data: notificationReadAt }, { data: organizations }, { data: offers }] = await Promise.all([
      supabase.rpc('my_network'),
      supabase.from('public_member_profiles').select('profile').order('name'),
      supabase.rpc('my_subscriptions'),
      supabase.from('categories').select('name').order('sort_order').order('name'),
      supabase.from('public_member_posts').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('public_ideas').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.rpc('my_subscription_read_state'),
      supabase.from('public_organizations').select('id,name').order('name'),
      supabase.from('public_organization_offers').select('*').order('created_at', { ascending: false }).limit(100),
    ]);
    if (error) return say(`Rrjeti nuk u ngarkua: ${error.message}`, 'error');
    if (!network) return say('Profili yt ende nuk është aprovuar. Sapo të aprovohet, rrjeti yt shfaqet këtu.');
    const members: any[] = (rows || []).map((row: any) => row.profile);
    const byUsername = new Map(members.map(member => [member.username, member]));
    const me = byUsername.get(network.username) || { username: network.username, name: session.user.email || 'Ti' };
    let following: string[] = network.following;
    const followers: string[] = network.followers;
    document.querySelector<HTMLElement>('#signed-in')!.hidden = false;
    document.querySelector('#network-profile-name')!.textContent = me.name || 'Profili im';
    document.querySelector('#network-profile-headline')!.textContent = me.headline || me.title || 'Anëtar i komunitetit Illyrian Brains';
    document.querySelector('#network-profile-location')!.textContent = [me.city, me.country].filter(Boolean).join(' · ');
    const profileAvatar = document.querySelector<HTMLElement>('#network-profile-avatar')!;
    if (me.avatar) { const image = document.createElement('img'); image.src = me.avatar; image.alt = ''; profileAvatar.append(image); }
    else profileAvatar.textContent = initials(me.name || 'IB');

    const lower = (value?: string) => (value || '').toLocaleLowerCase('sq');
    const myFields: string[] = me.fieldsOfExpertise || [];
    const sharesCity = (member: any) => Boolean(me.city && lower(member.city) === lower(me.city));
    const sharedFields = (member: any) => (member.fieldsOfExpertise || []).filter((field: string) => myFields.some(mine => lower(mine) === lower(field)));
    const others = members.filter(member => member.username !== me.username);
    document.querySelector('#stat-city')!.textContent = String(others.filter(sharesCity).length);
    if (me.city) document.querySelector('#stat-city-label')!.textContent = `Në ${me.city}`;
    document.querySelector('#stat-fields')!.textContent = String(others.filter(member => sharedFields(member).length).length);
    document.querySelector<HTMLElement>('#incomplete-note')!.hidden = Boolean(me.city && myFields.length);

    // --- Subscribed cities and fields -----------------------------------------
    type Subscription = { kind: 'city' | 'field' | 'organization'; value: string };
    let followedTopics: Subscription[] = Array.isArray(subscriptions) ? subscriptions : [];
    let lastNotificationRead = notificationReadAt ? new Date(notificationReadAt).getTime() : Date.now();
    const citySelect = document.querySelector<HTMLSelectElement>('#subscription-city')!;
    const fieldSelect = document.querySelector<HTMLSelectElement>('#subscription-field')!;
    const organizationSelect = document.querySelector<HTMLSelectElement>('#subscription-organization')!;
    const organizationNames = new Map((organizations || []).map((item: any) => [String(item.id), item.name]));
    const addOptions = (select: HTMLSelectElement, values: string[]) => values.forEach(value => select.add(new Option(value, value)));
    addOptions(citySelect, JSON.parse(root.dataset.cities || '[]'));
    addOptions(fieldSelect, (categories || []).map((item: any) => item.name));
    (organizations || []).forEach((item: any) => organizationSelect.add(new Option(item.name, String(item.id))));
    const canonicalTopic = (value?: string) => {
      const normalized = lower(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      if (['tech', 'technology', 'teknologji', 'teknologjia', 'it', 'informatike'].includes(normalized)) return 'teknologji';
      return normalized;
    };
    const topicMatches = (member: any, topic: Subscription, tags: string[] = []) => {
      const wanted = canonicalTopic(topic.value);
      if (tags.some(tag => canonicalTopic(tag) === wanted)) return true;
      return topic.kind === 'city' ? canonicalTopic(member?.city) === wanted
        : (member?.fieldsOfExpertise || []).some((field: string) => canonicalTopic(field) === wanted);
    };
    const setSubscription = async (kind: Subscription['kind'], value: string, on: boolean) => {
      if (!value) return;
      const { error } = await supabase.rpc('set_subscription', { p_kind: kind, p_value: value, p_on: on });
      if (error) return say(`Nuk u krye: ${error.message}`, 'error');
      followedTopics = on ? [{ kind, value }, ...followedTopics.filter(topic => topic.kind !== kind || topic.value !== value)] : followedTopics.filter(topic => topic.kind !== kind || topic.value !== value);
      renderSubscriptions();
    };
    const renderSubscriptions = () => {
      const chips = document.querySelector<HTMLElement>('#subscription-chips')!;
      document.querySelector('#subscription-total')!.textContent = String(followedTopics.length);
      ([['city', citySelect], ['field', fieldSelect], ['organization', organizationSelect]] as const).forEach(([kind, select]) => {
        [...select.options].forEach(option => { option.disabled = Boolean(option.value && followedTopics.some(topic => topic.kind === kind && topic.value === option.value)); });
      });
      if (!followedTopics.length) {
        const empty = document.createElement('div'); empty.className = 'my-subscriptions-empty';
        const mark = document.createElement('span'); mark.textContent = '+';
        const copy = document.createElement('div'); const title = document.createElement('strong'); title.textContent = 'Ende pa abonime';
        const hint = document.createElement('small'); hint.textContent = 'Zgjidh diçka nga lista në të majtë për të filluar.';
        copy.append(title, hint); empty.append(mark, copy); chips.replaceChildren(empty);
      } else {
        const labels = { city: ['Qytete', '⌖'], field: ['Fusha profesionale', '◇'], organization: ['Subjekte', '□'] } as const;
        const groups = (['city', 'field', 'organization'] as const).map(kind => {
          const topics = followedTopics.filter(topic => topic.kind === kind);
          if (!topics.length) return null;
          const group = document.createElement('section'); group.className = `my-subscription-group is-${kind}`;
          const heading = document.createElement('h4'); heading.textContent = `${labels[kind][1]} ${labels[kind][0]}`;
          const items = document.createElement('div');
          topics.forEach(topic => {
            const topicLabel = topic.kind === 'organization' ? organizationNames.get(topic.value) || 'Subjekt' : topic.value;
            const chip = document.createElement('button'); chip.type = 'button'; chip.className = `my-subscription-chip is-${topic.kind}`;
            const name = document.createElement('span'); name.textContent = topicLabel;
            const remove = document.createElement('b'); remove.textContent = '×'; remove.setAttribute('aria-hidden', 'true');
            chip.append(name, remove); chip.title = `Mos ndiq më ${topicLabel}`; chip.setAttribute('aria-label', `Mos ndiq më ${topicLabel}`);
            chip.addEventListener('click', async () => { chip.disabled = true; await setSubscription(topic.kind, topic.value, false); });
            items.append(chip);
          });
          group.append(heading, items); return group;
        }).filter(Boolean) as HTMLElement[];
        chips.replaceChildren(...groups);
      }
      const feed = document.querySelector<HTMLElement>('#subscription-feed')!;
      const postItems = (posts || []).map((post: MemberPost) => ({ post, member: byUsername.get(post.username) })).map(({ post, member }) => ({ date: post.created_at, post, topics: followedTopics.filter(topic => topic.kind !== 'organization' && topicMatches(member, topic, post.tags || [])) })).filter(item => item.topics.length);
      const ideaItems = (ideas || []).map((idea: any) => ({ date: idea.created_at, idea, topics: followedTopics.filter(topic => topic.kind !== 'organization' && topicMatches(byUsername.get(idea.author_username), topic, idea.tags || [])) })).filter((item: any) => item.topics.length);
      const offerItems = (offers || []).map((offer: any) => ({ date: offer.created_at, offer, topics: followedTopics.filter(topic => topic.kind === 'organization' && topic.value === String(offer.organization_id)) })).filter((item: any) => item.topics.length);
      const allRelevant: any[] = [...postItems, ...ideaItems, ...offerItems].sort((a, b) => b.date.localeCompare(a.date));
      const unread = allRelevant.filter(item => new Date(item.date).getTime() > lastNotificationRead).length;
      document.querySelector('#stat-notifications')!.textContent = String(unread);
      const readButton = document.querySelector<HTMLButtonElement>('#notifications-read')!;
      readButton.hidden = unread === 0;
      const relevant = allRelevant.slice(0, 8);
      if (!relevant.length) {
        const empty = document.createElement('p'); empty.className = 'network-people-empty'; empty.textContent = followedTopics.length ? 'Nuk ka ende përditësime nga abonimet e zgjedhura.' : 'Shto një qytet ose fushë profesionale për të marrë përditësime këtu.'; feed.replaceChildren(empty);
      } else feed.replaceChildren(...relevant.map((item: any) => {
        const wrap = document.createElement('div'); wrap.className = `my-subscription-post${new Date(item.date).getTime() > lastNotificationRead ? ' is-unread' : ''}`;
        const reason = document.createElement('p'); reason.className = 'my-subscription-reason'; reason.textContent = item.topics.map((topic: Subscription) => topic.kind === 'organization' ? organizationNames.get(topic.value) || 'Subjekt' : topic.value).join(' · ');
        if (item.post) {
          const card = postElement(item.post);
          const body = card.querySelector<HTMLElement>('.post-card-body');
          if (body) body.textContent = preview(item.post.body);
          card.classList.add('subscription-preview-card'); wrap.append(reason, card);
        }
        else if (item.idea) {
          const card = document.createElement('article'); card.className = 'post-card offer-notification';
          const meta = document.createElement('small'); meta.textContent = [item.idea.name || 'Njoftim nga rrjeti', new Date(item.idea.created_at).toLocaleDateString('sq-AL')].join(' · ');
          const title = document.createElement('h4'); title.textContent = item.idea.title;
          const description = document.createElement('p'); description.className = 'post-card-body'; description.textContent = preview(item.idea.description || '');
          const link = document.createElement('a'); link.href = `/projektet/ide/${encodeURIComponent(item.idea.slug)}/`; link.textContent = 'Lexo njoftimin →';
          card.append(meta, title, description, link); wrap.append(reason, card);
        } else {
          const card = document.createElement('article'); card.className = 'post-card offer-notification';
          const meta = document.createElement('small'); meta.textContent = `${item.offer.organization_name} · Ofertë`;
          const title = document.createElement('h4'); title.textContent = item.offer.title;
          const description = document.createElement('p'); description.className = 'post-card-body'; description.textContent = preview(item.offer.description);
          card.append(meta, title, description);
          const link = document.createElement('a'); link.href = `/rrjeti/postimet/#offer-${item.offer.id}`; link.textContent = 'Shiko te Postimet →'; card.append(link);
          wrap.append(reason, card);
        }
        return wrap;
      }));
    };
    document.querySelectorAll<HTMLButtonElement>('[data-add-kind]').forEach(button => button.addEventListener('click', async () => {
      const kind = button.dataset.addKind as Subscription['kind']; const select = kind === 'city' ? citySelect : kind === 'field' ? fieldSelect : organizationSelect; const value = select.value;
      if (!value || followedTopics.some(topic => topic.kind === kind && topic.value === value)) return;
      button.disabled = true; await setSubscription(kind, value, true); button.disabled = false; select.value = '';
    }));
    renderSubscriptions();
    document.querySelector('#notification-open')!.addEventListener('click', () => {
      const panel = document.querySelector<HTMLElement>('#subscriptions-panel')!;
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    document.querySelector('#notifications-read')!.addEventListener('click', async () => {
      const button = document.querySelector<HTMLButtonElement>('#notifications-read')!;
      button.disabled = true;
      const { data, error } = await supabase.rpc('mark_subscription_notifications_read');
      button.disabled = false;
      if (error) return say(`Njoftimet nuk u përditësuan: ${error.message}`, 'error');
      lastNotificationRead = new Date(data).getTime();
      renderSubscriptions();
    });

    // Everyone who shares something with me, best matches first; the graph shows the
    // strongest of them plus everyone I follow or who follows me.
    const related = relatedMembers(me, members, 400);
    const reasonOf = new Map(related.map(({ member, reason }) => [member.username, reason]));
    // Similarity out of what relatedMembers() could score for me: city 3, each field 2,
    // working in the field I aim for 2 (+1 if they mentor), each skill 1.
    const possibleScore = (me.city ? 3 : 0) + myFields.length * 2 + (me.aspirations?.field ? 3 : 0) + (me.specialty || []).length;
    const topScore = related[0]?.score || 1;

    // --- Follow ---------------------------------------------------------------
    const setFollow = async (username: string, on: boolean) => {
      const { error } = await supabase.rpc('set_follow', { p_username: username, p_follow: on });
      if (error) { say(`Nuk u krye: ${error.message}`, 'error'); return false; }
      following = on ? [username, ...following] : following.filter(name => name !== username);
      renderPeople();
      renderRecommended();
      cy.getElementById(`person:${username}`).toggleClass('is-following', on);
      if (selected === username) showSelected(username);
      return true;
    };
    const followButton = (member: any) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'profile-editor-text-button';
      const label = () => { button.textContent = following.includes(member.username) ? 'Po e ndjek ✓' : 'Ndiq +'; };
      label();
      button.addEventListener('click', async () => {
        button.disabled = true;
        await setFollow(member.username, !following.includes(member.username));
        button.disabled = false;
        label();
      });
      return button;
    };

    // --- Side lists -----------------------------------------------------------
    const avatarEl = (member: any) => {
      const avatar = document.createElement(member.avatar ? 'img' : 'span') as HTMLImageElement;
      avatar.className = `member-avatar${member.avatar ? '' : ' member-avatar-fallback'}`;
      if (member.avatar) { avatar.src = member.avatar; avatar.alt = ''; avatar.loading = 'lazy'; }
      else avatar.textContent = initials(member.name);
      return avatar;
    };
    const personRow = (member: any, note = '', withFollow = true) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = memberUrl(member.username);
      const text = document.createElement('span');
      const name = document.createElement('strong');
      name.textContent = member.name;
      const small = document.createElement('small');
      small.textContent = note || member.title || (member.fieldsOfExpertise || []).join(' · ');
      text.append(name, small);
      link.append(avatarEl(member), text);
      item.append(link);
      if (withFollow) item.append(followButton(member));
      return item;
    };
    const fillList = (id: string, items: HTMLElement[], empty: string) => {
      const list = document.querySelector<HTMLElement>(`#${id}`)!;
      if (items.length) list.replaceChildren(...items);
      else { const note = document.createElement('li'); note.className = 'network-people-empty'; note.textContent = empty; list.replaceChildren(note); }
    };
    const renderPeople = () => {
      const known = (usernames: string[]) => usernames.map(username => byUsername.get(username)).filter(Boolean);
      document.querySelector('#following-title')!.textContent = `Ndjek (${following.length})`;
      document.querySelector('#stat-following')!.textContent = String(following.length);
      fillList('following', known(following).map(member => personRow(member)), 'Ende nuk ndjek askënd.');
      document.querySelector('#followers-title')!.textContent = `Të ndjekin (${followers.length})`;
      document.querySelector('#stat-followers')!.textContent = String(followers.length);
      fillList('followers', known(followers).map(member => personRow(member, '', !following.includes(member.username))), 'Ende askush.');
    };
    renderPeople();

    // --- Groups (for the graph) ------------------------------------------------
    // Everyone who shares my city and/or a field, grouped by exactly what we share
    // ("Berlin · Shëndeti", "Berlin", "Shëndeti"), plus the people I follow or who
    // follow me without sharing anything. Strongest groups (most shared) first.
    const hubs: { id: string; label: string; type: 'city' | 'field' }[] = [
      ...(me.city ? [{ id: `city:${me.city}`, label: me.city, type: 'city' as const }] : []),
      ...myFields.map(field => ({ id: `field:${field}`, label: field, type: 'field' as const })),
    ];
    const hubsOf = (member: any) => hubs.filter(hub => hub.type === 'city' ? sharesCity(member) : sharedFields(member).some((field: string) => lower(field) === lower(hub.label)));
    interface Group { key: string; label: string; hubs: typeof hubs; members: any[] }
    const groupMap = new Map<string, Group>();
    const addToGroup = (member: any) => {
      const shared = hubsOf(member);
      const key = shared.length ? shared.map(hub => hub.id).join('|') : 'direct';
      if (!groupMap.has(key)) groupMap.set(key, { key, label: shared.length ? shared.map(hub => hub.label).join(' · ') : 'Ndjek / të ndjekin', hubs: shared, members: [] });
      groupMap.get(key)!.members.push(member);
    };
    related.forEach(({ member }) => addToGroup(member));
    [...new Set([...following, ...followers])].forEach(username => {
      const member = byUsername.get(username);
      if (member && username !== me.username && !reasonOf.has(username)) addToGroup(member);
    });
    const groups = [...groupMap.values()].sort((a, b) => (a.key === 'direct' ? 1 : 0) - (b.key === 'direct' ? 1 : 0) || b.hubs.length - a.hubs.length || b.members.length - a.members.length);

    // --- Recommended connections ----------------------------------------------
    // The scored relatedMembers() as a grid of cards, best match first. Each card is
    // tinted by its score relative to the best match, and shows its % of what we
    // could share at most.
    const PAGE = 24;
    let shown = PAGE;
    const moreButton = document.querySelector<HTMLButtonElement>('#recommended-more')!;
    moreButton.addEventListener('click', () => { shown += PAGE; renderRecommended(); });
    const renderRecommended = () => {
      const wrap = document.querySelector<HTMLElement>('#recommended')!;
      if (!related.length) {
        const note = document.createElement('p');
        note.className = 'network-people-empty';
        note.textContent = 'Ende askush nuk ndan qytetin apo fushat e tua.';
        wrap.replaceChildren(note);
      } else wrap.replaceChildren(...related.slice(0, shown).map(({ member, reason, score }) => {
        const card = document.createElement('article');
        card.className = 'my-network-match';
        card.style.setProperty('--match', String(score / topScore));
        const percent = document.createElement('span');
        percent.className = 'my-network-match-score';
        percent.textContent = `${Math.min(100, Math.round((100 * score) / (possibleScore || score)))}%`;
        percent.title = 'Sa ndani nga qyteti, fushat dhe aftësitë e tua';
        const head = document.createElement('a');
        head.className = 'my-network-match-head';
        head.href = memberUrl(member.username);
        const text = document.createElement('span');
        const name = document.createElement('strong');
        name.textContent = member.name;
        const small = document.createElement('small');
        small.textContent = [member.title, member.city].filter(Boolean).join(' · ');
        text.append(name, small);
        head.append(avatarEl(member), text);
        const shared = document.createElement('p');
        shared.className = 'my-network-match-shared';
        reason.split(' · ').forEach(item => {
          const chip = document.createElement('span');
          chip.textContent = item;
          shared.append(chip);
        });
        const foot = document.createElement('div');
        foot.className = 'my-network-match-foot';
        if (followers.includes(member.username)) {
          const badge = document.createElement('small');
          badge.textContent = 'Të ndjek';
          foot.append(badge);
        }
        foot.append(followButton(member));
        card.append(percent, head, shared, foot);
        return card;
      }));
      moreButton.hidden = shown >= related.length;
      moreButton.textContent = `Shfaq më shumë (${related.length - Math.min(shown, related.length)})`;
    };
    renderRecommended();

    // --- Graph ----------------------------------------------------------------
    // Me in the middle, my city and fields on a ring around me, and each group as a
    // box of people out beyond the city/fields it shares (a box between two hubs
    // shares both). Big groups show their best matches plus everyone I follow.
    const PER_GROUP = 14;
    const elements: any[] = [{ data: { id: 'me', label: me.name, type: 'me' } }];
    hubs.forEach(hub => elements.push({ data: { id: hub.id, label: hub.label, type: hub.type } }, { data: { id: `me--${hub.id}`, source: 'me', target: hub.id } }));
    const positions = new Map<string, { x: number; y: number }>([['me', { x: 0, y: 0 }]]);
    const onCircle = (radius: number, angle: number) => ({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
    const hubAngle = new Map(hubs.map((hub, index) => [hub.id, -Math.PI / 2 + (2 * Math.PI * index) / hubs.length]));
    hubs.forEach(hub => positions.set(hub.id, onCircle(140, hubAngle.get(hub.id)!)));
    // A group sits at the average direction of its hubs; the no-hub group takes the widest free gap.
    const groupAngle = new Map<string, number>();
    groups.filter(group => group.key !== 'direct').forEach(group => {
      const x = group.hubs.reduce((sum, hub) => sum + Math.cos(hubAngle.get(hub.id)!), 0), y = group.hubs.reduce((sum, hub) => sum + Math.sin(hubAngle.get(hub.id)!), 0);
      groupAngle.set(group.key, Math.abs(x) + Math.abs(y) < 1e-6 ? hubAngle.get(group.hubs[0].id)! + Math.PI / 2 : Math.atan2(y, x));
    });
    if (groupMap.has('direct')) {
      const taken = [...groupAngle.values()].map(angle => (angle + 2 * Math.PI) % (2 * Math.PI)).sort((a, b) => a - b);
      let best = Math.PI / 2;
      if (taken.length) {
        let widest = -1;
        taken.forEach((angle, index) => { const next = index + 1 < taken.length ? taken[index + 1] : taken[0] + 2 * Math.PI; if (next - angle > widest) { widest = next - angle; best = angle + widest / 2; } });
      }
      groupAngle.set('direct', best);
    }
    groups.forEach(group => {
      const inGraph = [...group.members.filter(member => following.includes(member.username)), ...group.members.filter(member => !following.includes(member.username))].slice(0, Math.max(PER_GROUP, group.members.filter(member => following.includes(member.username)).length));
      const parent = `group:${group.key}`;
      const more = group.members.length - inGraph.length;
      elements.push({ data: { id: parent, label: `${group.label} · ${group.members.length}${more > 0 ? ` (+${more} në listë)` : ''}`, type: 'group' } });
      group.hubs.forEach(hub => elements.push({ data: { id: `${parent}--${hub.id}`, source: parent, target: hub.id } }));
      if (group.key === 'direct') elements.push({ data: { id: `${parent}--me`, source: parent, target: 'me' }, classes: 'direct' });
      // People in a sunflower spiral around the group's centre.
      const spacing = 38, clusterRadius = spacing * Math.sqrt(inGraph.length);
      const centre = onCircle(140 + 60 + clusterRadius, groupAngle.get(group.key)!);
      inGraph.forEach((member, index) => {
        const id = `person:${member.username}`;
        elements.push({ data: { id, parent, label: member.name, type: 'person', username: member.username }, classes: following.includes(member.username) ? 'is-following' : '' });
        const r = spacing * Math.sqrt(index + .5), a = index * 2.39996;
        positions.set(id, { x: centre.x + r * Math.cos(a), y: centre.y + r * Math.sin(a) });
      });
    });

    const cy = cytoscape({
      container: document.querySelector<HTMLElement>('#my-network-graph'),
      elements,
      style: [
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
      ],
      // Positions worked out above: me, the ring of hubs, the groups beyond them.
      layout: { name: 'preset', positions: (node: any) => positions.get(node.id()), padding: 30 } as any,
      minZoom: .3, maxZoom: 3, wheelSensitivity: .25, boxSelectionEnabled: false,
    });

    const selectedBox = document.querySelector<HTMLElement>('#selected')!;
    const hint = document.querySelector<HTMLElement>('#graph-hint')!;
    let selected = '';
    const clear = () => { cy.elements().removeClass('faded focused'); selected = ''; selectedBox.hidden = true; hint.hidden = false; };
    // A person in the graph: who they are, what links you, open the profile, follow.
    const showSelected = (username: string) => {
      const member = byUsername.get(username);
      if (!member) return;
      selected = username;
      const head = document.createElement('a');
      head.className = 'my-network-selected-head';
      head.href = memberUrl(username);
      const text = document.createElement('span');
      const name = document.createElement('strong');
      name.textContent = member.name;
      const small = document.createElement('small');
      small.textContent = [member.title, member.city].filter(Boolean).join(' · ');
      text.append(name, small);
      head.append(avatarEl(member), text);
      const why = document.createElement('p');
      const tags = [reasonOf.get(username), following.includes(username) ? 'E ndjek' : '', followers.includes(username) ? 'Të ndjek' : ''].filter(Boolean);
      why.textContent = tags.length ? tags.join(' · ') : '';
      const actions = document.createElement('div');
      actions.className = 'my-network-selected-actions';
      const open = document.createElement('a');
      open.className = 'partner-button';
      open.href = memberUrl(username);
      open.innerHTML = 'Hap profilin <span aria-hidden="true">→</span>';
      actions.append(open, followButton(member));
      selectedBox.replaceChildren(head, why, actions);
      selectedBox.hidden = false;
      hint.hidden = true;
    };
    cy.on('tap', 'node', event => {
      event.stopPropagation();   // a tap on a person would otherwise bubble to its group box
      const node = event.target;
      const type = node.data('type');
      // A person lights up with their group and what the group shares; a group with its
      // people; a city/field (or me) with the groups around it and their people.
      const lit = type === 'person' ? node.union(node.parent()).union(node.parent().closedNeighborhood())
        : type === 'group' ? node.closedNeighborhood().union(node.children())
        : node.closedNeighborhood().union(node.neighborhood('node[type="group"]').children());
      cy.elements().addClass('faded').removeClass('focused');
      lit.removeClass('faded');
      node.addClass('focused');
      if (type === 'person') return showSelected(node.data('username'));
      selected = '';
      selectedBox.hidden = true;
      hint.hidden = false;
      const groupKeys = (type === 'group' ? node : node.neighborhood('node[type="group"]')).map((group: any) => group.id().slice('group:'.length));
      const count = groups.filter(group => groupKeys.includes(group.key)).reduce((sum, group) => sum + group.members.length, 0);
      hint.innerHTML = '';
      const strong = document.createElement('strong');
      strong.textContent = type === 'me' ? 'Ti' : type === 'group' ? node.data('label').split(' · ').slice(0, -1).join(' · ') : node.data('label');
      hint.append(strong, ` · ${count} ${count === 1 ? 'person' : 'persona'}`);
    });
    cy.on('tap', event => { if (event.target === cy) { clear(); hint.textContent = 'Zgjidh një person, qytetin ose një fushë në graf për të parë lidhjet.'; } });
    // Fit everything in, but don't blow a small network up to giant nodes.
    const fit = () => { cy.resize(); cy.fit(undefined, 30); if (cy.zoom() > 1.3) { cy.zoom(1.3); cy.center(); } };
    document.querySelector('#graph-reset')!.addEventListener('click', () => { clear(); fit(); });
    new ResizeObserver(() => requestAnimationFrame(fit)).observe(document.querySelector<HTMLElement>('#my-network-graph')!);
    document.querySelector<HTMLDetailsElement>('#graph-panel')!.addEventListener('toggle', event => { if ((event.currentTarget as HTMLDetailsElement).open) requestAnimationFrame(fit); });
    if (groups.length === 0) hint.textContent = 'Grafi mbushet sapo të shtosh qytetin dhe fushat në profil, ose të ndjekësh dikë.';
  }
