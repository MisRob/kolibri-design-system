<template>

  <DocsPageTemplate>

    <DocsPageSection title="1. Install the plugin" anchor="#plugin-installation">
      <p>Kolibri Design System (KDS) is a Vue plugin. Register it in your app alongside scripts that are needed for its full functioning:</p>

      <!-- eslint-disable -->
      <DocsShowCode language="javascript">
        import KThemePlugin from 'kolibri-design-system/lib/KThemePlugin';
        import trackInputModality from 'kolibri-design-system/lib/styles/trackInputModality';
        import trackMediaType from 'kolibri-design-system/lib/styles/trackMediaType';

        Vue.use(KThemePlugin);

        trackInputModality();
        trackMediaType();
      </DocsShowCode>
      <!-- eslint-enable -->

      <p>This installs <code>$themeBrand</code>, <code>$themeTokens</code> <code>$themePalette</code>, and <code>$computedClass</code> helpers on all Vue instances.</p>

      <p>Furthermore, it provides <code>$coreOutline</code>, <code>$inputModality</code>, <code>$mediaType</code>, and <code>$isPrint</code> computed properties as well as <code>$print</code> method to all Vue instances.</p>

      <p>Lastly, it globally registers all KDS Vue components.</p>
    </DocsPageSection>

    <DocsPageSection title="2. Initialize global DOM elements" anchor="#initialize-dom">
      <p>Next, initialize global KDS DOM elements via the <code>initializeDom(appRootEl)</code>. It is recommended to call the method in the <code>mounted</code> hook of the root Vue instance:</p>

      <!-- eslint-disable -->
      <DocsShowCode language="javascript">
        import initializeDom from 'kolibri-design-system/lib/initializeDom';

        const app = new Vue({
          el: '#app',
          mounted() {
            initializeDom(this.$el);
          },
        });
      </DocsShowCode>
      <!-- eslint-enable -->

      <p>This attaches <code>&lt;div id="k-live-region"&gt;</code> to the top of your app's root element.</p>

      <p>Do not initialize it any deeper in the DOM. It is important that these global DOM elements are high in the DOM structure.</p>

      <p>See <DocsInternalLink href="/usekliveregion" text="useKLiveRegion" /> to understand how to utilize the live region.</p>
    </DocsPageSection>

    <DocsPageSection title="3. Initialize theme" anchor="#initialize-theme">
      <p>
        Until this section is better documented (TODO link GH issue), refer to <DocsExternalLink href="https://github.com/learningequality/kolibri/blob/develop/kolibri/core/assets/src/styles/initializeTheme.js" text="Kolibri's initializeTheme.js" />.
      </p>
    </DocsPageSection>

  </DocsPageTemplate>

</template>

