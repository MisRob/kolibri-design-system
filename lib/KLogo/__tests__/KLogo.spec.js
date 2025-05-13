import { renderComponentForVisualTest, takeSnapshot } from '../../../jest.conf/visual.testUtils';

describe.visual('KLogo', () => {
  const snapshotOptions = { widths: [400], minHeight: 512 };
  describe('Render KLogo with different props', () => {
    it('Render a default logo', async () => {
      await renderComponentForVisualTest('KLogo', { altText: 'Kolibri default logo', size: '150' });
      await takeSnapshot('KLogo - default', snapshotOptions);
    });
    it('Render a logo with background', async () => {
      await renderComponentForVisualTest('KLogo', {
        altText: 'Kolibri Logo with background',
        size: '150',
        showBackground: true,
      });
      await takeSnapshot('KLogo - background', snapshotOptions);
    });
    it('Render a logo with rectangular background', async () => {
      await renderComponentForVisualTest('KLogo', {
        altText: 'Kolibri rectangular background',
        size: '150',
        backgroundStyle: 'rect',
        showBackground: true,
      });
      await takeSnapshot('KLogo - rectangular background', snapshotOptions);
    });
    it('Render a logo with dimensions', async () => {
      await renderComponentForVisualTest('KLogo', {
        altText: 'Kolibri rectangular background',
        size: '150',
        backgroundStyle: 'rect',
        showBackground: true,
        maxSize: '60px',
        minSize: '30px',
      });
      await takeSnapshot('KLogo - dimensions', snapshotOptions);
    });
  });

  describe('Render a logo with different color schemes', () => {
    it('color: whiteGrey', async () => {
      await renderComponentForVisualTest('KLogo', {
        altText: 'Kolibri logo - whiteGrey',
        size: '150',
        colorScheme: 'whiteGrey',
        showBackground: true,
        backgroundStyle: 'rect',
      });
      await takeSnapshot('KLogo - whiteGrey', snapshotOptions);
    });
    it('color: blackGrey', async () => {
      await renderComponentForVisualTest('KLogo', {
        altText: 'Kolibri logo - blackGrey',
        size: '150',
        colorScheme: 'blackGrey',
        showBackground: true,
        backgroundStyle: 'rect',
      });
      await takeSnapshot('KLogo - blackGrey', snapshotOptions);
    });
  });
});
