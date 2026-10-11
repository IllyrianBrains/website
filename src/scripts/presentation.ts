import Reveal from 'reveal.js';
import RevealNotes from 'reveal.js/plugin/notes/notes.esm.js';
import cytoscape from 'cytoscape';
import { createGovernanceGraph } from './presentation-governance';

const revealElement = document.querySelector<HTMLElement>('.reveal');
if (!revealElement) throw new Error('Presentation element not found');
const mobilePresentation = window.matchMedia('(max-width: 760px)');
const deck = new Reveal(revealElement, { hash: true, controls: true, controlsTutorial: false, progress: true, slideNumber: 'c/t', center: false, transition: 'fade', backgroundTransition: 'fade', touch: true, width: mobilePresentation.matches ? 390 : 1440, height: mobilePresentation.matches ? 844 : 900, margin: 0, minScale: 0.2, maxScale: 1.6, plugins: [RevealNotes] });
await deck.initialize();
const mapElement = document.querySelector<HTMLElement>('#presentation-map');
const L = (window as any).L;
let map: any;
if (mapElement && L) {
  map = L.map(mapElement, { zoomControl: false, scrollWheelZoom: false, attributionControl: true }).setView([44, 8], 3);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap' }).addTo(map);
  const cityData = JSON.parse(mapElement.dataset.cities || '[]');
  const markers = cityData.map((city: any) => ({ city, marker: L.circleMarker([city.lat, city.lng], { radius: city.status === 'active' ? 7 : 5, color: '#fff', weight: 1.5, fillColor: city.status === 'active' ? city.color : '#8b8d93', fillOpacity: city.status === 'active' ? .9 : .5 }).bindTooltip(`<strong>${city.city}</strong><br>${city.country}`, { direction: 'top' }) }));
  const showScope = (scope: string) => {
    const visible = markers.filter(({ city }: any) => city.scope === scope);
    markers.forEach(({ marker }: any) => { if (map.hasLayer(marker)) map.removeLayer(marker); });
    visible.forEach(({ marker }: any) => marker.addTo(map));
    if (visible.length) map.fitBounds(L.featureGroup(visible.map(({ marker }: any) => marker)).getBounds(), { padding: [35, 35], maxZoom: 5 });
    document.querySelectorAll<HTMLButtonElement>('[data-map-scope]').forEach(button => { const active = button.dataset.mapScope === scope; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
  };
  document.querySelectorAll<HTMLButtonElement>('[data-map-scope]').forEach(button => button.addEventListener('click', event => { event.stopPropagation(); showScope(button.dataset.mapScope || 'europe'); }));
  showScope('europe');
}
const valueElement = document.querySelector<HTMLElement>('#value-graph');
const valueGraph = valueElement ? cytoscape({
  container: valueElement,
  elements: [
    { data: { id: 'you', label: 'TI', kind: 'you' }, position: { x: 125, y: 305 } },
    { data: { id: 'target', label: 'PERSONI\nQË KËRKON', kind: 'target' }, position: { x: 595, y: 155 } },
    ...[[245,105],[365,80],[490,70],[650,285],[550,390],[425,485],[280,465],[115,475],[80,150],[250,250],[380,210],[500,275],[350,350],[220,375],[680,90],[690,445],[420,40],[45,350]].map(([x,y], i) => ({ data: { id: `person-${i}`, kind: 'person' }, position: { x, y } })),
    ...[['you','person-8'],['you','person-9'],['you','person-13'],['person-8','person-0'],['person-0','person-1'],['person-0','person-9'],['person-9','person-10'],['person-9','person-12'],['person-13','person-12'],['person-13','person-6'],['person-6','person-5'],['person-10','person-2'],['person-10','person-11'],['person-12','person-11'],['person-12','person-5'],['person-2','target'],['person-11','person-3'],['person-11','person-4'],['person-4','person-15'],['person-3','person-14'],['person-1','person-16'],['person-6','person-7'],['person-7','person-17']].map(([source,target], i) => ({ data: { id: `value-edge-${i}`, source, target }, classes: [['you','person-9'],['person-9','person-10'],['person-10','person-2'],['person-2','target']].some(([a,b]) => a === source && b === target) ? 'value-path' : '' })),
  ],
  style: [
    { selector: 'node', style: { width: 29, height: 29, 'background-color': '#aaa9ae', 'border-width': 1, 'border-color': '#fff' } },
    { selector: 'node[kind="you"]', style: { label: 'data(label)', width: 92, height: 92, color: '#fff', 'font-family': 'Inter', 'font-size': 17, 'font-weight': 800, 'text-valign': 'center', 'text-halign': 'center', 'background-color': '#5b4553', 'border-width': 5, 'border-color': '#b9a4b0' } },
    { selector: 'node[kind="target"]', style: { label: 'data(label)', shape: 'round-rectangle', width: 142, height: 82, color: '#fff', 'font-family': 'Inter', 'font-size': 11, 'font-weight': 800, 'text-wrap': 'wrap', 'text-max-width': 110, 'text-valign': 'center', 'text-halign': 'center', 'background-color': '#665735', 'border-width': 4, 'border-color': '#b5a47b' } },
    { selector: 'edge', style: { width: 1.3, 'line-color': '#aaa9ae', opacity: .52, 'curve-style': 'bezier' } },
    { selector: 'edge.value-path', style: { width: 4, 'line-color': '#806574', opacity: 1 } },
  ],
  layout: { name: 'preset', fit: true, padding: 30 },
  userZoomingEnabled: false, userPanningEnabled: false, boxSelectionEnabled: false,
}) : undefined;

const governanceGraph = createGovernanceGraph();
const graphElement = document.querySelector<HTMLElement>('#presentation-graph');
const graph = graphElement ? cytoscape({
  container: graphElement,
  elements: [
    { data: { id: 'you', label: 'TI', kind: 'core' }, position: { x: 390, y: 315 } },
    { data: { id: 'city', label: 'QYTETI\nBerlin', kind: 'component' }, position: { x: 190, y: 180 } },
    { data: { id: 'profession', label: 'PROFESIONI\nTeknologji', kind: 'component' }, position: { x: 590, y: 180 } },
    { data: { id: 'interest', label: 'INTERESI\nGrupi i librit', kind: 'component' }, position: { x: 190, y: 455 } },
    { data: { id: 'project', label: 'PROJEKTI\nMentoring', kind: 'component' }, position: { x: 590, y: 455 } },
    { data: { id: 'p1', label: 'Elira', kind: 'person' }, position: { x: 55, y: 95 } },
    { data: { id: 'p2', label: 'Arben', kind: 'person' }, position: { x: 55, y: 245 } },
    { data: { id: 'p3', label: 'Mira', kind: 'person' }, position: { x: 725, y: 95 } },
    { data: { id: 'p4', label: 'Liridon', kind: 'person' }, position: { x: 725, y: 245 } },
    { data: { id: 'p5', label: 'Ana', kind: 'person' }, position: { x: 55, y: 390 } },
    { data: { id: 'p6', label: 'Besnik', kind: 'person' }, position: { x: 55, y: 535 } },
    { data: { id: 'p7', label: 'Dea', kind: 'person' }, position: { x: 725, y: 390 } },
    { data: { id: 'p8', label: 'Gent', kind: 'person' }, position: { x: 725, y: 535 } },
    ...[['you','city'],['you','profession'],['you','interest'],['you','project'],['city','p1'],['city','p2'],['profession','p3'],['profession','p4'],['interest','p5'],['interest','p6'],['project','p7'],['project','p8'],['p1','interest'],['p4','project'],['p6','city'],['p7','profession']].map(([source, target], i) => ({ data: { id: `career-edge-${i}`, source, target }, classes: source === 'you' ? 'direct' : '' })),
  ],
  style: [
    { selector: 'node', style: { label: 'data(label)', shape: 'round-rectangle', width: 106, height: 48, color: '#fff', 'font-family': 'Inter', 'font-size': 11, 'font-weight': 700, 'text-wrap': 'wrap', 'text-max-width': 96, 'text-valign': 'center', 'text-halign': 'center', 'background-color': '#4f5058', 'border-width': 1.5, 'border-color': '#8b8d93' } },
    { selector: 'node[kind="core"]', style: { shape: 'ellipse', width: 105, height: 105, 'font-size': 18, 'background-color': '#5b4553', color: '#fff', 'border-width': 5, 'border-color': '#b9a4b0' } },
    { selector: 'node[kind="component"]', style: { width: 138, height: 70, 'background-color': '#34424e', 'border-width': 3, 'border-color': '#71808b', 'font-size': 11 } },
    { selector: 'node[kind="person"]', style: { shape: 'ellipse', width: 58, height: 58, 'background-color': '#44343e', 'border-color': '#806276', 'font-size': 9 } },
    { selector: 'edge', style: { width: 1.5, 'line-color': '#706873', opacity: .68, 'curve-style': 'bezier' } },
    { selector: 'edge.direct', style: { width: 4, 'line-color': '#b88da6', opacity: 1 } },
  ],
  layout: { name: 'preset', fit: true, padding: 35 },
  userZoomingEnabled: false, userPanningEnabled: false, boxSelectionEnabled: false,
}) : undefined;
deck.on('slidechanged', event => {
  if (event.currentSlide?.querySelector('#value-graph')) setTimeout(() => { valueGraph?.resize(); valueGraph?.fit(undefined, 25); }, 100);
  if (event.currentSlide?.querySelector('#governance-graph')) setTimeout(() => { governanceGraph?.resize(); governanceGraph?.fit(undefined, 25); }, 100);
  if (event.currentSlide?.querySelector('#presentation-map')) setTimeout(() => map?.invalidateSize(), 100);
  if (event.currentSlide?.querySelector('#presentation-graph')) setTimeout(() => { graph?.resize(); graph?.fit(undefined, 35); }, 100);
});
const fullscreenButton = document.querySelector<HTMLButtonElement>('[data-fullscreen]');
fullscreenButton?.addEventListener('click', async () => { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); });
document.addEventListener('fullscreenchange', () => { const label = fullscreenButton?.querySelector('span'); if (label) label.textContent = document.fullscreenElement ? 'Dil nga ekrani i plotë' : 'Ekran i plotë'; });
