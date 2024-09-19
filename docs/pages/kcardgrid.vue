<template>

  <DocsPageTemplate apiDocs>
    <DocsPageSection title="Overview" anchor="#overview">
      <p>Displays a grid of cards <DocsLibraryLink component="KCard" />.</p>

      <p><code>KCardGrid</code> provides base layouts for the most common grids in our ecosystem, as well as advanced configuration via <code>useKCardGrid</code> (TBD), allowing customization or complete override of the base layouts.</p>

      <p>Together with <code>KCard</code>, it ensures accessible navigation within card lists, such as announcing only their titles when using the tab key to avoid overwhelming screen reader outputs.</p>

      <p>Grid's visual behavior is based on the <DocsInternalLink text="window breakpoint system" href="/layout#responsiveness" />. <code>KCardGrid</code> determines how many cards per row to display based on its layout and a current window breakpoint.</p>

      <p><code>KCardGrid</code> doesn't manage inner card content. This is <code>KCardGrid</code>'s responsibility.</p>
    </DocsPageSection>

    <DocsPageSection title="Guidelines" anchor="#guidelines">
      <ul>
        <li>
          <code>KCardGrid</code> must be a direct parent of <code>KCard</code> (<DocsInternalLink text="KCard: KCard and KCardGrid" href="/kcard#k-card-and-grid" />)
        </li>
        <li>
          Avoid setting  card widths. Rely on <code>KCardGrid</code> layouts and customization options (<DocsInternalLink text="Base layouts" href="#base-layouts" />, <DocsInternalLink text="Layout customization" href="#layout-customization" />)
        </li>
        <li>
          Avoid setting card heights. Instead, set heights on card sections, use text truncation, or limit content in other ways (<DocsInternalLink text="Card height, content tolerance and  alignment" href="#card-height-and-alignment" />)
        </li>
        <li>
          Ensure robust content tolerance and consistent content alignment (<DocsInternalLink text="Card height, content tolerance and  alignment" href="#card-height-and-alignment" />)
        </li>
        <li>Preview cards on all screen sizes  (<DocsInternalLink text="Fine-tuning responsiveness" href="#fine-tuning-responsiveness" />)</li>
      </ul>

      <p>Also follow <DocsInternalLink text="KCard guidelines" href="/kcard#guidelines" />.</p>
    </DocsPageSection>

    <DocsPageSection title="Usage" anchor="#usage">
      <DocsSubNav
        :items="[
          { text: 'Base layouts', href: '#base-layouts' },
          { text: 'Layout customization (TBD)', href: '#layout-customization' },
          { text: 'Card height, content tolerance and  alignment', href: '#card-height-and-alignment' },
          { text: 'Fine-tuning responsiveness', href: '#fine-tuning-responsiveness' },
          { text: 'Loading state (TBD)', href: '#loading-state' },
        ]"
      />

      <h3>
        Base layouts
        <DocsAnchorTarget anchor="#base-layouts" />
      </h3>

      <p>Three base layouts are available: <code>'1-1-1'</code>, <code>'1-2-2'</code>, and <code>'1-2-3'</code>. They determine the number of cards per row for each <DocsInternalLink text="window breakpoint level" href="/layout#responsiveness" />.</p>

      <h4>
        '1-1-1' grid
        <DocsAnchorTarget anchor="#1-1-1-grid" />
      </h4>
      <p>Displays a grid with 1 card per row on every screen size. <DocsToggleButton contentId="more-1-1-1-grid" showText="Show full definition" hideText="Hide full definition" /></p>

      <DocsToggleContent id="more-1-1-1-grid">
        <DocsTable>
          <tr>
            <th></th>
            <th>Level 0</th>
            <th>Level 1</th>
            <th>Level 2</th>
            <th>Level 3</th>
            <th>Level 4</th>
            <th>Level 5</th>
            <th>Level 6</th>
            <th>Level 7</th>
          </tr>
          <tr>
            <th>Cards per row</th>
            <td>1</td>
            <td>1</td>
            <td>1</td>
            <td>1</td>
            <td>1</td>
            <td>1</td>
            <td>1</td>
            <td>1</td>
          </tr>
        </DocsTable>
      </DocsToggleContent>

      <DocsShow block>
        <KCardGrid
          layout="1-1-1"
          :layoutOverride="layoutOverride"
          :skeletonsConfig="skeletonsConfig"
        >
          <DocsKCard
            v-for="i in 2"
            :key="i"
            :headingLevel="5"
            orientation="horizontal"
            :prependTitle="`(${i})`"
          />
        </KCardGrid>
      </DocsShow>

    </DocsPageSection>
  </DocsPageTemplate>

</template>


<script>

  import useKResponsiveWindow from '../../lib/composables/useKResponsiveWindow';
  import DocsKCard from '../pages-components/DocsKCard';

  export default {
    components: {
      DocsKCard,
    },
    setup() {
      const { windowBreakpoint } = useKResponsiveWindow();
      return { windowBreakpoint };
    },
    data() {
      return {
        skeletonsConfig: {
          /* 'level-0': {
            count: 3,
            height: '200px',
            orientation: 'vertical',
            thumbnailDisplay: 'large',
            thumbnailAlign: 'right',
          },
          'level-1': {
            count: 3,
            height: '200px',
            orientation: 'vertical',
            thumbnailDisplay: 'large',
            thumbnailAlign: 'right',
          },
          'level-2': {
            count: 3,
            height: '200px',
            orientation: 'vertical',
            thumbnailDisplay: 'large',
            thumbnailAlign: 'right',
          },
          'level-3': {
            count: 3,
            height: '200px',
            orientation: 'vertical',
            thumbnailDisplay: 'large',
            thumbnailAlign: 'right',
          },
          'level-4': {
            count: 3,
            height: '200px',
            orientation: 'vertical',
            thumbnailDisplay: 'large',
            thumbnailAlign: 'right',
          },
          'level-5': {
            count: 3,
            height: '200px',
            orientation: 'vertical',
            thumbnailDisplay: 'large',
            thumbnailAlign: 'right',
          },
          'level-6': {
            count: 3,
            height: '200px',
            orientation: 'vertical',
            thumbnailDisplay: 'large',
            thumbnailAlign: 'right',
          },
          'level-7': {
            count: 3,
            height: '200px',
            orientation: 'vertical',
            thumbnailDisplay: 'large',
            thumbnailAlign: 'right',
          }, */
        },
        layoutOverride: {
          /* 'level-0': {
            cardsPerRow: 2,
          },
          'level-1': {
            cardsPerRow: 2,
            columnGap: '20px',
            rowGap: '20px',
          },
          'level-2': {
            cardsPerRow: 5,
            rowHeight: '600px',
          },
          'level-3': {
            cardsPerRow: 5,
            rowHeight: '600px',
          },
          'level-4': {
            cardsPerRow: 5,
            rowHeight: '600px',
          },
          'level-5': {
            cardsPerRow: 5,
            rowHeight: '600px',
          },
          'level-6': {
            cardsPerRow: 5,
            rowHeight: '600px',
          },
          'level-7': {
            cardsPerRow: 5,
            rowHeight: '600px',
          }, */
        },
      };
    },
    computed: {
      slicedPills() {
        return ['Short Activity', 'Biology', 'Ecology', 'Ornithology'].slice(0, 2);
      },
    },
  };

</script>


<style lang="scss" scoped>

  .pills {
    margin-left: -6px;

    span {
      display: inline-block;
      padding: 6px 8px;
      margin: 6px;
    }
  }

</style>