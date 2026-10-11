import cytoscape from 'cytoscape';
import { governanceElements } from './presentation-governance-elements';
import { governanceStyles } from './presentation-governance-styles';

export const createGovernanceGraph = () => {
  const element = document.querySelector<HTMLElement>('#governance-graph');
  if (!element) return undefined;
  return cytoscape({
    container: element,
    elements: governanceElements,
    style: governanceStyles,
    layout: { name: 'preset', fit: true, padding: 35 },
    userZoomingEnabled: false,
    userPanningEnabled: false,
    boxSelectionEnabled: false,
  });
};
