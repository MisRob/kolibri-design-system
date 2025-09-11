import { renderComponentForVisualTest, takeSnapshot } from '../../../jest.conf/visual.testUtils';

describe.visual('KCheckbox visual tests', () => {
  const snapshotOptions = { widths: [375, 520] };
  it('renders', async () => {
    await renderComponentForVisualTest('KCheckboxVisualTest');
    await takeSnapshot('KCheckbox visual tests', snapshotOptions);
  });
});
