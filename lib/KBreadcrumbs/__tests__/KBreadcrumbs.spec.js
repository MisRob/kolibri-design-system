import {
  renderComponentForVisualTest,
  takeSnapshot,
  click,
} from '../../../jest.conf/visual.testUtils';

describe.visual('KBreadcrumbs Visual Tests', () => {
  const snapshotOptions = { widths: [800], minHeight: 1000 };

  it('Breadcrumbs - Visual Tests', async () => {
    await renderComponentForVisualTest('KBreadcrumbsVisualTest');

    await click('#with-overflow .breadcrumbs-dropdown-wrapper button');

    await takeSnapshot('KBreadcrumbs visual tests', snapshotOptions);
  });
});
