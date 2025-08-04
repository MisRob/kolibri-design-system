import { renderComponentForVisualTest, takeSnapshot } from '../../../jest.conf/visual.testUtils';

describe.visual('KIcon visual tests', () => {
  const snapshotOptions = { widths: [800], minHeight: 512 };
  it('renders', async () => {
    await renderComponentForVisualTest('KIconVisualTest');
    await takeSnapshot('KIcon visual tests', snapshotOptions);
  });
});
