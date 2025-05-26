import {
    renderComponentForVisualTest,
    takeSnapshot,
  } from '../../../jest.conf/visual.testUtils';

describe.visual('KIcon Visual Tests', () => {
  it('renders profile icon with default color', async () => {
    await renderComponentForVisualTest('KIcon', {
      icon: 'profile',
    });
    await takeSnapshot('KIcon - profile icon (default color)');
  });

  it('renders profile icon with green color', async () => {
    await renderComponentForVisualTest('KIcon', {
      icon: 'profile',
      color: 'green',
    });
    await takeSnapshot('KIcon - profile icon (green color)');
  });

  it('renders allActivities icon which ignores color prop', async () => {
    await renderComponentForVisualTest('KIcon', {
      icon: 'allActivities',
      color: 'green',
    });
    await takeSnapshot('KIcon - allActivities icon (color prop ignored)');
  });

  it('shows broken image for non-existent icon', async () => {
    await renderComponentForVisualTest('KIcon', {
      icon: 'NonExistentIcon',
    });
    await takeSnapshot('KIcon - broken image for non-existent icon');
  });
});