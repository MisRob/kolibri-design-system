import { renderComponentForVisualTest, takeSnapshot } from '../../../jest.conf/visual.testUtils';

describe.visual('KTable visual tests', () => {
  const snapshotOptions = { widths: [900], minHeight: 512 };
  it('renders', async () => {
    await renderComponentForVisualTest('KTableVisualTest');
    await takeSnapshot('KTable visual tests', snapshotOptions);
  });
});
