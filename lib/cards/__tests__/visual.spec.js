import {
  renderComponentForVisualTest,
  takeSnapshot,
  delay,
} from '../../../jest.conf/visual.testUtils';

describe.visual('Cards visual tests', () => {
  const snapshotOptions = { widths: [1380], minHeight: 512 };
  it('renders', async () => {
    await renderComponentForVisualTest('CardsVisualTest');

    // Wait for loading animation to complete
    await delay(4000);

    await takeSnapshot('Cards visual tests', snapshotOptions);
  });
});
