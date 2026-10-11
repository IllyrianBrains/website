export const governanceStyles: any[] = [
  // ============================================================
  // BASE
  // ============================================================

  {
    selector: 'node',
    style: {
      label: 'data(label)',
      shape: 'round-rectangle',

      width: 105,
      height: 46,

      color: '#fff',

      'font-family': 'Inter',
      'font-size': 10,
      'font-weight': 700,

      'text-wrap': 'wrap',
      'text-max-width': 92,
      'text-valign': 'center',
      'text-halign': 'center',

      'background-color': '#4c5560',

      'border-width': 1.5,
      'border-color': '#87919b',
    },
  },

  // ============================================================
  // LEVEL 1
  // ============================================================

  {
    selector: 'node[kind="network"]',
    style: {
      width: 155,
      height: 78,

      'font-size': 14,
      'font-weight': 800,

      'background-color': '#5b4553',

      'border-width': 5,
      'border-color': '#b9a4b0',
    },
  },

  {
    selector: 'node[kind="secretariat"]',
    style: {
      width: 125,
      height: 58,

      'font-size': 10,

      'background-color': '#744761',

      'border-width': 2,
      'border-color': '#c9aebd',
    },
  },

  // ============================================================
  // CITIES — BLUE
  // ============================================================

  {
    selector: 'node[kind="city-hub"]',
    style: {
      width: 140,
      height: 62,

      'font-size': 12,
      'font-weight': 800,

      'background-color': '#355368',

      'border-width': 4,
      'border-color': '#9bb9cc',
    },
  },

  {
    selector: 'node[kind="city"]',
    style: {
      'background-color': '#355368',
      'border-color': '#7896aa',
    },
  },

  {
    selector: 'node.formal',
    style: {
      'border-width': 4,
      'border-color': '#b6d3d4',
    },
  },

  // ============================================================
  // PROFESSIONAL GROUPS — PURPLE
  // ============================================================

  {
    selector: 'node[kind="group-hub"]',
    style: {
      width: 140,
      height: 62,

      'font-size': 11,
      'font-weight': 800,

      'background-color': '#5b526e',

      'border-width': 4,
      'border-color': '#aa9fbd',
    },
  },

  {
    selector: 'node[kind="group"]',
    style: {
      'background-color': '#5b526e',
      'border-color': '#9589aa',
    },
  },

  // ============================================================
  // PROJECTS — GOLD
  // ============================================================

  {
    selector: 'node[kind="project-hub"]',
    style: {
      width: 140,
      height: 62,

      'font-size': 12,
      'font-weight': 800,

      'background-color': '#665735',

      'border-width': 4,
      'border-color': '#b5a47b',
    },
  },

  {
    selector: 'node[kind="project"]',
    style: {
      'background-color': '#665735',
      'border-color': '#a89567',
    },
  },

  // ============================================================
  // LEVEL 4 — ACTIVITIES
  // Keep parent's color family
  // ============================================================

  {
    selector: 'node[kind="activity"][parentKind="city"]',
    style: {
      width: 80,
      height: 34,

      'font-size': 9,

      'background-color': '#355368',

      'border-width': 1.5,
      'border-style': 'dashed',
      'border-color': '#9bb9cc',
    },
  },

  {
    selector: 'node[kind="activity"][parentKind="group"]',
    style: {
      width: 80,
      height: 34,

      'font-size': 9,

      'background-color': '#5b526e',

      'border-width': 1.5,
      'border-style': 'dashed',
      'border-color': '#aa9fbd',
    },
  },

  // ============================================================
  // EDGES
  // ============================================================

  {
    selector: 'edge',
    style: {
      width: 1.5,

      'line-color': '#777b82',
      opacity: 0.65,

      'curve-style': 'straight',

      'target-arrow-shape': 'none',
    },
  },

  // Network → three dimensions
  {
    selector: 'edge.network-link',
    style: {
      width: 3,
      'line-color': '#8f7885',
      opacity: 0.9,

      'curve-style': 'bezier',
    },
  },

  // Blue
  {
    selector: 'edge.city-link',
    style: {
      width: 2,
      'line-color': '#7898ad',
      opacity: 0.85,
    },
  },

  // Purple
  {
    selector: 'edge.professional-link',
    style: {
      width: 2,
      'line-color': '#9589aa',
      opacity: 0.85,
    },
  },

  // Gold
  {
    selector: 'edge.project-link',
    style: {
      width: 2,
      'line-color': '#a89567',
      opacity: 0.85,
    },
  },

  // Level 4 keeps parent color
  {
    selector: 'edge.city-detail-link',
    style: {
      width: 1.2,
      'line-color': '#7898ad',
      'line-style': 'dashed',
      opacity: 0.6,
    },
  },

  {
    selector: 'edge.group-detail-link',
    style: {
      width: 1.2,
      'line-color': '#9589aa',
      'line-style': 'dashed',
      opacity: 0.6,
    },
  },

  // Secretariat relationship
  {
    selector: 'edge.support-link',
    style: {
      width: 1.5,

      'line-color': '#c9aebd',
      'line-style': 'dashed',

      opacity: 0.65,

      'curve-style': 'bezier',
    },
  },

  // Relationships between branches
  {
    selector: 'edge.cross-link',
    style: {
      width: 1,

      'line-color': '#aaa9ae',
      'line-style': 'dashed',

      opacity: 0.22,

      'curve-style': 'bezier',
    },
  },
];

