import { renderComponentForVisualTest, takeSnapshot } from '../../../jest.conf/visual.testUtils';

describe.visual('Cards visual tests', () => {
  const snapshotOptions = { widths: [1380], minHeight: 512 };
  it('renders', async () => {
    await renderComponentForVisualTest('CardsVisualTest');

    await takeSnapshot('Cards visual tests', snapshotOptions);
  });
});
