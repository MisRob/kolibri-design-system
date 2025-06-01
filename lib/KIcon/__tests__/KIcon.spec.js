import { renderComponentForVisualTest, takeSnapshot } from '../../../jest.conf/visual.testUtils';

describe.visual('KIcon Visual Tests', () => {
  const snapshotOptions = { widths: [400], minHeight: 512 };
  it('renders profile icon with default color', async () => {
    await renderComponentForVisualTest('KIcon', {
      icon: 'profile',
    });
    await takeSnapshot('KIcon - profile icon (default color)', snapshotOptions);
  });

  it('renders profile icon with green color', async () => {
    await renderComponentForVisualTest('KIcon', {
      icon: 'profile',
      color: 'green',
    });
    await takeSnapshot('KIcon - profile icon (green color)', snapshotOptions);
  });

  it('renders allActivities icon which ignores color prop', async () => {
    await renderComponentForVisualTest('KIcon', {
      icon: 'allActivities',
      color: 'green',
    });
    await takeSnapshot('KIcon - allActivities icon (color prop ignored)', snapshotOptions);
  });

  it('renders broken image for non-existent icon', async () => {
    await renderComponentForVisualTest('KIcon', {
      icon: 'Non icon',
    });
    await takeSnapshot('KIcon - broken image for non-existent icon', snapshotOptions);
  });
});
