import { renderComponentForVisualTest, takeSnapshot } from '../../../jest.conf/visual.testUtils';

describe.visual('Sortable Table Visual Test', () => {
  const snapshotOptions = { widths: [600], minHeight: 200 };

  it('renders header with correct borderBottom style', async () => {
    await renderComponentForVisualTest('KTable', {
      headers: [
        { label: 'Name', dataType: 'string', columnId: 'name' },
        { label: 'Age', dataType: 'number', columnId: 'age' },
      ],
      rows: [
        ['Alice', 25],
        ['Bob', 30],
      ],
      caption: 'Test Table',
      sortable: true,
    });

    await takeSnapshot('KTable - Header borderBottom style', snapshotOptions, async page => {
      const th = await page.$('thead th');
      const borderBottom = await page.evaluate(el => getComputedStyle(el).borderBottom, th);
      const borderColor = await page.evaluate(el => getComputedStyle(el).borderBottomColor, th);

      const themeFineLine = '#e0e0e0'; // Using dummy color here.

      expect(borderBottom).toContain('1px solid');
      expect(borderColor.toLowerCase()).toBe(themeFineLine.toLowerCase());
    });
  });
});
