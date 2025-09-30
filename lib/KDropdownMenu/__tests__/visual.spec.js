import { renderComponentForVisualTest, takeSnapshot } from '../../../jest.conf/visual.testUtils';

describe.visual('KDropdownMenu Visual Tests', () => {
  const snapshotOptions = {
    widths: [400],
    minHeight: 520,
  };

  it('renders', async () => {
    // set viewport height to a large value to ensure the dropdown fits without flipping
    await page.setViewport({ width: 400, height: 1500 });
    await renderComponentForVisualTest('KDropdownMenuVisualTest');
    await takeSnapshot('KDropdownMenu visual tests', snapshotOptions);
  });
});
