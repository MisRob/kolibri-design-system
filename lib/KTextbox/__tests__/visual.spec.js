import {
  click,
  renderComponentForVisualTest,
  takeSnapshot,
} from '../../../jest.conf/visual.testUtils';

describe.visual('KTextbox visual tests', () => {
  const snapshotOptions = { widths: [800], minHeight: 512 };
  it('renders', async () => {
    await renderComponentForVisualTest('KTextboxVisualTest');

    // Prepares active textbox test case
    await click('#active-textbox input');

    await takeSnapshot('KTextbox visual tests', snapshotOptions);
  });
});
