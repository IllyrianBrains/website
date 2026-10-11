export const governanceElements = [
  // ============================================================
  // LEVEL 1 — NETWORK
  // ============================================================

  {
    data: {
      id: 'network',
      label: 'ILLYRIAN\nBRAINS',
      kind: 'network',
    },
    position: { x: 410, y: 65 },
  },

  // Secretariat is support / coordination, not the network itself
  {
    data: {
      id: 'secretariat',
      label: 'IB OJF\nSEKRETARIATI',
      kind: 'secretariat',
    },
    position: { x: 720, y: 65 },
  },

  // ============================================================
  // LEVEL 2 — WAYS THE NETWORK ORGANISES
  // ============================================================

  {
    data: {
      id: 'cities',
      label: 'QYTETET',
      kind: 'city-hub',
    },
    position: { x: 170, y: 210 },
  },

  {
    data: {
      id: 'groups',
      label: 'GRUPET\nPROFESIONALE',
      kind: 'group-hub',
    },
    position: { x: 410, y: 210 },
  },

  {
    data: {
      id: 'projects',
      label: 'PROJEKTET',
      kind: 'project-hub',
    },
    position: { x: 650, y: 210 },
  },

  // ============================================================
  // LEVEL 3 — CITIES
  // ============================================================

  {
    data: {
      id: 'new-york',
      label: 'New York',
      kind: 'city',
    },
    position: { x: 105, y: 340 },
  },

  {
    data: {
      id: 'milano',
      label: 'Milano',
      kind: 'city',
    },
    classes: 'formal',
    position: { x: 235, y: 340 },
  },

  {
    data: {
      id: 'berlin',
      label: 'Berlin',
      kind: 'city',
    },
    position: { x: 105, y: 410 },
  },

  {
    data: {
      id: 'tirana',
      label: 'Tirana',
      kind: 'city',
    },
    position: { x: 235, y: 410 },
  },

  // ============================================================
  // LEVEL 3 — PROFESSIONAL GROUPS
  // ============================================================

  {
    data: {
      id: 'tech',
      label: 'IB Tech',
      kind: 'group',
    },
    position: { x: 410, y: 340 },
  },

  {
    data: {
      id: 'business',
      label: 'IB Business',
      kind: 'group',
    },
    position: { x: 410, y: 410 },
  },

  // ============================================================
  // LEVEL 3 — PROJECTS
  // ============================================================

  {
    data: {
      id: 'atlas',
      label: 'Atlas',
      kind: 'project',
    },
    position: { x: 585, y: 340 },
  },

  {
    data: {
      id: 'mentoring',
      label: 'Mentoring',
      kind: 'project',
    },
    position: { x: 715, y: 340 },
  },

  {
    data: {
      id: 'heritage',
      label: 'Heritage',
      kind: 'project',
    },
    position: { x: 585, y: 410 },
  },

  {
    data: {
      id: 'locals',
      label: 'Locals',
      kind: 'project',
    },
    position: { x: 715, y: 410 },
  },

  // ============================================================
  // LEVEL 4 — ACTIVITIES / SUBGROUPS
  // ============================================================

  {
    data: {
      id: 'book-club',
      label: 'Book Club',
      kind: 'activity',
      parentKind: 'city',
    },
    position: { x: 105, y: 505 },
  },

  {
    data: {
      id: 'webinar',
      label: 'Webinar',
      kind: 'activity',
      parentKind: 'group',
    },
    position: { x: 410, y: 505 },
  },

  // ============================================================
  // CONNECTIONS
  // ============================================================

  ...[
    // Network → dimensions
    ['network', 'cities', 'network-link'],
    ['network', 'groups', 'network-link'],
    ['network', 'projects', 'network-link'],

    // Secretariat supports the whole network
    ['secretariat', 'network', 'support-link'],

    // Cities
    ['cities', 'new-york', 'city-link'],
    ['cities', 'milano', 'city-link'],
    ['cities', 'berlin', 'city-link'],
    ['cities', 'tirana', 'city-link'],

    // Professional groups
    ['groups', 'tech', 'professional-link'],
    ['groups', 'business', 'professional-link'],

    // Projects
    ['projects', 'atlas', 'project-link'],
    ['projects', 'mentoring', 'project-link'],
    ['projects', 'heritage', 'project-link'],
    ['projects', 'locals', 'project-link'],

    // Level 4
    ['berlin', 'book-club', 'city-detail-link'],
    ['business', 'webinar', 'group-detail-link'],

    // Cross-network relationships
    ['berlin', 'atlas', 'cross-link'],
    ['tech', 'atlas', 'cross-link'],
    ['business', 'mentoring', 'cross-link'],
    ['milano', 'mentoring', 'cross-link'],
  ].map(([source, target, classes], index) => ({
    data: {
      id: `governance-edge-${index}`,
      source,
      target,
    },
    classes,
  })),
];

