import {
  renderComponentForVisualTest,
  delay,
  takeSnapshot,
} from '../../../jest.conf/visual.testUtils';

describe.visual('Cards visual tests', () => {
  const snapshotOptions = { widths: [1380], minHeight: 512 };
  it('renders', async () => {
    await renderComponentForVisualTest('CardsVisualTest');

    // Await for loading states to be rendered
    // Make sure there is a little padding time to prevent race conditions
    await delay(1100);

    await takeSnapshot('Cards visual tests', snapshotOptions);
  });
});
