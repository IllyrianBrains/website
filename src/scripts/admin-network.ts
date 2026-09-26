import cytoscape from 'cytoscape';

const normalized = (value: unknown) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('sq');
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character] || character));

export function initAdminNetwork(members: any[]) {
  const container = document.querySelector<HTMLElement>('#admin-network-graph');
  const search = document.querySelector<HTMLInputElement>('#network-search');
  const dimension = document.querySelector<HTMLSelectElement>('#network-dimension');
  const status = document.querySelector<HTMLSelectElement>('#network-status');
  const note = document.querySelector<HTMLElement>('#network-note');
  const visibleCount = document.querySelector<HTMLElement>('#network-visible-count');
  const connectionCount = document.querySelector<HTMLElement>('#network-connection-count');
  if (!container || !search || !dimension || !status || !note || !visibleCount || !connectionCount) return;

  const elements: any[] = [{ data: { id: 'hub', label: 'Illyrian Brains', type: 'hub' } }];
  const nodeIds = new Set(['hub']);
  const edgeIds = new Set<string>();
  const addNode = (id: string, label: string, type: string, extra: Record<string, unknown> = {}) => {
    if (!nodeIds.has(id)) { nodeIds.add(id); elements.push({ data: { id, label, type, ...extra } }); }
  };
  const addEdge = (source: string, target: string, type: string) => {
    const id = `${source}--${target}`;
    if (!edgeIds.has(id)) { edgeIds.add(id); elements.push({ data: { id, source, target, type } }); }
  };

  members.forEach(member => {
    const personId = `person:${member.id}`;
    addNode(personId, member.name, 'person', {
      username: member.username,
      status: member.status === 'ok' ? 'ok' : 'pending',
      search: normalized([member.name, member.username, member.city, ...(member.fields_of_expertise || [])].join(' ')),
    });
    addEdge('hub', personId, 'membership');
    if (member.city?.trim()) {
      const cityId = `city:${normalized(member.city)}`;
      addNode(cityId, member.city.trim(), 'city');
      addEdge(personId, cityId, 'city');
    }
    (member.fields_of_expertise || []).forEach((field: string) => {
      if (!field?.trim()) return;
      const expertiseId = `expertise:${normalized(field)}`;
      addNode(expertiseId, field.trim(), 'expertise');
      addEdge(personId, expertiseId, 'expertise');
    });
  });

  const network = cytoscape({
    container, elements,
    style: [
      { selector: 'node', style: { label: 'data(label)', 'font-family': 'Inter, sans-serif', 'font-size': 9, 'text-wrap': 'wrap', 'text-max-width': 90, 'text-valign': 'bottom', 'text-margin-y': 7, color: '#56535a', width: 14, height: 14, 'background-color': '#744761' } },
      { selector: 'node[type="hub"]', style: { width: 70, height: 70, 'font-size': 13, 'font-weight': 800, color: '#211d22', 'background-color': '#211d22', 'border-width': 7, 'border-color': '#eadce4' } },
      { selector: 'node[type="city"]', style: { shape: 'diamond', width: 34, height: 34, 'font-size': 11, 'font-weight': 700, color: '#293f52', 'background-color': '#293f52', 'border-width': 5, 'border-color': '#e1e8ed' } },
      { selector: 'node[type="expertise"]', style: { shape: 'round-rectangle', width: 43, height: 25, 'font-size': 10, 'font-weight': 700, color: '#765410', 'background-color': '#b98545', 'border-width': 4, 'border-color': '#f2e4d2' } },
      { selector: 'node[type="person"][status="pending"]', style: { 'background-color': '#fff', 'border-width': 3, 'border-color': '#b98545' } },
      { selector: 'edge', style: { width: 1, 'line-color': '#cfc7cc', 'curve-style': 'bezier', opacity: .52 } },
      { selector: 'edge[type="membership"]', style: { width: .55, 'line-color': '#dedadf', opacity: .28 } },
      { selector: '.network-hidden', style: { display: 'none' } },
      { selector: '.network-muted', style: { opacity: .09 } },
      { selector: '.network-focused', style: { 'border-width': 5, 'border-color': '#d7a9c1', 'z-index': 20 } },
    ],
    layout: { name: 'cose', animate: false, fit: true, padding: 45, nodeRepulsion: 7200, idealEdgeLength: 66, edgeElasticity: 70, gravity: .32, numIter: 550 },
    minZoom: .2, maxZoom: 3, wheelSensitivity: .22, boxSelectionEnabled: false,
  });

  const clearFocus = () => { network.elements().removeClass('network-muted network-focused'); note.textContent = 'Kliko mbi një nyje për të parë lidhjet.'; };
  const visibleElements = () => network.elements().filter(element => !element.hasClass('network-hidden'));
  const fit = () => { const shown = visibleElements(); if (shown.length) network.fit(shown, 42); };
  const applyFilters = () => {
    clearFocus();
    network.elements().removeClass('network-hidden');
    const query = normalized(search.value.trim());
    const wantedStatus = status.value;
    const hiddenPeople = network.nodes('[type="person"]').filter(node =>
      (wantedStatus && node.data('status') !== wantedStatus) || (query && !node.data('search').includes(query))
    );
    hiddenPeople.addClass('network-hidden');
    hiddenPeople.connectedEdges().addClass('network-hidden');
    if (dimension.value !== 'all') network.edges(`[type != "${dimension.value}"][type != "membership"]`).addClass('network-hidden');
    network.nodes('[type="city"], [type="expertise"]').forEach(node => {
      if (!node.connectedEdges().filter(edge => !edge.hasClass('network-hidden')).length) node.addClass('network-hidden');
    });
    const people = network.nodes('[type="person"]').filter(node => !node.hasClass('network-hidden')).length;
    network.nodes('[type="hub"]').toggleClass('network-hidden', people === 0);
    const connections = network.edges().filter(edge => !edge.hasClass('network-hidden')).length;
    visibleCount.textContent = String(people);
    connectionCount.textContent = `${connections} lidhje`;
    note.textContent = query ? `${people} profile përputhen me kërkimin.` : 'Kliko mbi një nyje për të parë lidhjet.';
    requestAnimationFrame(fit);
  };

  network.on('tap', 'node', event => {
    const node = event.target;
    const neighborhood = node.closedNeighborhood().filter(element => !element.hasClass('network-hidden'));
    visibleElements().addClass('network-muted');
    neighborhood.removeClass('network-muted');
    node.addClass('network-focused');
    const people = node.data('type') === 'person' ? 1 : neighborhood.nodes('[type="person"]').length;
    note.innerHTML = `<strong>${escapeHtml(node.data('label'))}</strong> · ${people} ${people === 1 ? 'anëtar' : 'anëtarë'} · ${node.degree()} lidhje`;
  });
  network.on('tap', event => { if (event.target === network) clearFocus(); });
  network.on('dbltap', 'node[type="person"]', event => {
    window.location.href = `/anetaresohu/profili/?u=${encodeURIComponent(event.target.data('username'))}`;
  });
  [dimension, status].forEach(control => control.addEventListener('change', applyFilters));
  search.addEventListener('input', applyFilters);
  document.querySelector('#network-reset')?.addEventListener('click', () => {
    search.value = ''; dimension.value = 'all'; status.value = 'ok'; applyFilters();
  });
  let previousWidth = 0;
  new ResizeObserver(entries => {
    const width = entries[0]?.contentRect.width || 0;
    network.resize();
    if (Math.abs(width - previousWidth) > 2) { previousWidth = width; requestAnimationFrame(fit); }
  }).observe(container);
  applyFilters();
}
