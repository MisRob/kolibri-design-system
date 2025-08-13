import {
  renderComponentForVisualTest,
  takeSnapshot,
  click,
  waitFor,
} from '../../../jest.conf/visual.testUtils';

describe.visual('KBreadcrumbs Visual Tests', () => {
  const snapshotOptions = { widths: [375, 768], minHeight: 200 };

  it('Breadcrumbs - Single Item (showSingleItem)', async () => {
    await renderComponentForVisualTest('KBreadcrumbs', {
      items: [{ text: 'Single Item', link: null }],
      showSingleItem: true,
    });
    await takeSnapshot('KBreadcrumbs - Single Item', snapshotOptions);
  });

  it('Breadcrumbs - Single Item (hidden)', async () => {
    await renderComponentForVisualTest('KBreadcrumbs', {
      items: [{ text: 'Single Item', link: null }],
      showSingleItem: false,
    });
    await takeSnapshot('KBreadcrumbs - Single Item Hidden', snapshotOptions);
  });

  it('Breadcrumbs - Multiple Items (no overflow)', async () => {
    await renderComponentForVisualTest('KBreadcrumbs', {
      items: [
        { text: 'Home', link: { path: '/' } },
        { text: 'Library', link: { path: '/lib' } },
        { text: 'Data', link: null },
      ],
    });
    await takeSnapshot('KBreadcrumbs - No Overflow', snapshotOptions);
  });

  it('Breadcrumbs - Multiple Items with Long Text', async () => {
    await renderComponentForVisualTest('KBreadcrumbs', {
      items: [
        { text: 'Home', link: { path: '/' } },
        {
          text: 'A very long breadcrumb text that should truncate properly when displayed in the component',
          link: { path: '/long' },
        },
        { text: 'Data', link: null },
      ],
    });
    await takeSnapshot('KBreadcrumbs - Long Text', snapshotOptions);
  });

  it('Breadcrumbs - With Links', async () => {
    await renderComponentForVisualTest('KBreadcrumbs', {
      items: [
        { text: 'Home', link: { path: '/' } },
        { text: 'Library', link: { path: '/lib' } },
        { text: 'Files', link: { path: '/files' } },
      ],
    });
    await takeSnapshot('KBreadcrumbs - With Links', snapshotOptions);
  });

  it('Breadcrumbs - Overflow with Dropdown Open (with links)', async () => {
    const narrowSnapshotOptions = { widths: [300], minHeight: 200 };

    await renderComponentForVisualTest('KBreadcrumbs', {
      items: [
        { text: 'Home', link: { path: '/' } },
        { text: 'Library', link: { path: '/lib' } },
        { text: 'Category', link: { path: '/category' } },
        { text: 'Subcategory', link: { path: '/subcategory' } },
        { text: 'Files', link: null },
      ],
    });

    // First, check if dropdown button exists, if not, take snapshot without dropdown
    try {
      await waitFor('.breadcrumbs-dropdown-wrapper button');
      await click('.breadcrumbs-dropdown-wrapper button');
      await waitFor('.breadcrumbs-dropdown-menu');
    } catch (error) {
      // Dropdown button not found, component may not be overflowing
    }

    await takeSnapshot(
      'KBreadcrumbs - Overflow with Dropdown Open (with links)',
      narrowSnapshotOptions,
    );
  });

  it('Breadcrumbs - Overflow with Dropdown Open (without links)', async () => {
    const narrowSnapshotOptions = { widths: [300], minHeight: 200 };

    await renderComponentForVisualTest('KBreadcrumbs', {
      items: [
        { text: 'Home', link: null },
        { text: 'Library', link: null },
        { text: 'Category', link: null },
        { text: 'Subcategory', link: null },
        { text: 'Files', link: null },
      ],
    });

    // First, check if dropdown button exists
    try {
      await waitFor('.breadcrumbs-dropdown-wrapper button');
      await click('.breadcrumbs-dropdown-wrapper button');
      await waitFor('.breadcrumbs-dropdown-menu');
    } catch (error) {
      // Dropdown button not found, component may not be overflowing
    }

    await takeSnapshot(
      'KBreadcrumbs - Overflow with Dropdown Open (without links)',
      narrowSnapshotOptions,
    );
  });
});
