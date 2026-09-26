interface MapSetup<T = any> {
  L: any;
  map: any;
  data: T[];
  element: HTMLElement;
}

export function createDirectoryMap<T = any>(selector: string): MapSetup<T> | undefined {
  const element = document.querySelector<HTMLElement>(selector);
  const L = (window as any).L;
  if (!element || !L) return;
  const map = L.map(element, { scrollWheelZoom: true, doubleClickZoom: true, touchZoom: true, zoomControl: true }).setView([44, 8], 3);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  return { L, map, data: JSON.parse(element.dataset.cities || '[]'), element };
}

export function fitMarkers(L: any, map: any, markers: any[], padding: [number, number] = [40, 40]) {
  if (markers.length) map.fitBounds(L.featureGroup(markers).getBounds(), { padding });
}
