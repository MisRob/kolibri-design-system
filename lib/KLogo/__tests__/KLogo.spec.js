import { renderComponentForVisualTest, takeSnapshot } from '../../../jest.conf/visual.testUtils';

describe.visual('KLogo', () => {
  const snapshotOptions = { widths: [400], minHeight: 512 };
  describe('Render KLogo with different props', () => {
    it('Render a default logo', async () => {
      await renderComponentForVisualTest('KLogo', { altText: 'Kolibri default logo' });
      await takeSnapshot('KLogo - default', snapshotOptions);
    });
    it('Render a logo with background', async () => {
      await renderComponentForVisualTest('KLogo', {
        altText: 'Kolibri Logo with background',
        showBackground: true,
      });
      await takeSnapshot('KLogo - background', snapshotOptions);
    });
    it('Render a logo with rectangular background', async () => {
      await renderComponentForVisualTest('KLogo', {
        altText: 'Kolibri rectangular background',
        backgroundStyle: 'rect',
        showBackground: true,
      });
      await takeSnapshot('KLogo - rectangular background', snapshotOptions);
    });
    it('Render a logo with dimensions maxSize 10', async () => {
      await renderComponentForVisualTest('KLogo', {
        altText: 'Kolibri rectangular background',
        size: '15',
        backgroundStyle: 'rect',
        showBackground: true,
        maxSize: '10',
      });
      await takeSnapshot('KLogo - dimensions - maxSize 10', snapshotOptions);
    });

    it('Render a logo with dimensions maxSize 30', async () => {
      await renderComponentForVisualTest('KLogo', {
        altText: 'Kolibri rectangular background',
        size: '35',
        backgroundStyle: 'rect',
        showBackground: true,
        maxSize: '30',
      });
      await takeSnapshot('KLogo - dimensions - maxSize 30', snapshotOptions);
    });

    it('Render a logo with dimensions maxSize 60', async () => {
      await renderComponentForVisualTest('KLogo', {
        altText: 'Kolibri rectangular background',
        size: '65',
        backgroundStyle: 'rect',
        showBackground: true,
        maxSize: '60',
      });
      await takeSnapshot('KLogo - dimensions - maxSize 60', snapshotOptions);
    });
    
  });

  describe('Render a logo with different color schemes', () => {
    it('color: monoBlack', async () => {
      await renderComponentForVisualTest('KLogo', {
        altText: 'Kolibri logo - monoBlack',
        colorScheme: 'monoBlack',
        showBackground: true,
        backgroundStyle: 'rect',
      });
      await takeSnapshot('KLogo - monoBlack', snapshotOptions);
    });
    it('color: whiteGrey', async () => {
      await renderComponentForVisualTest('KLogo', {
        altText: 'Kolibri logo - whiteGrey',
        colorScheme: 'whiteGrey',
        showBackground: true,
        backgroundStyle: 'rect',
      });
      await takeSnapshot('KLogo - whiteGrey', snapshotOptions);
    });
    it('color: monoPrimary', async () => {
      await renderComponentForVisualTest('KLogo', {
        altText: 'Kolibri logo - monoPrimary',
        colorScheme: 'monoPrimary',
        showBackground: true,
        backgroundStyle: 'rect',
      });
      await takeSnapshot('KLogo - monoPrimary', snapshotOptions);
    });
    it('color: monoSecondary', async () => {
      await renderComponentForVisualTest('KLogo', {
        altText: 'Kolibri logo - monoSecondary',
        colorScheme: 'monoSecondary',
        showBackground: true,
        backgroundStyle: 'rect',
      });
      await takeSnapshot('KLogo - monoSecondary', snapshotOptions);
    });
    it('color: whiteGrey', async () => {
      await renderComponentForVisualTest('KLogo', {
        altText: 'Kolibri logo - whiteGrey',
        colorScheme: 'whiteGrey',
        showBackground: true,
        backgroundStyle: 'rect',
      });
      await takeSnapshot('KLogo - whiteGrey', snapshotOptions);
    });
    it('color: blackGrey', async () => {
      await renderComponentForVisualTest('KLogo', {
        altText: 'Kolibri logo - blackGrey',
        colorScheme: 'blackGrey',
        showBackground: true,
        backgroundStyle: 'rect',
      });
      await takeSnapshot('KLogo - blackGrey', snapshotOptions);
    });
  });
});
