<template>

  <div class="docs-example">
    <div
      class="code-toggle-button"
      :style="toggleButtonStyle"
    >
      <KIconButton
        appearance="raised-button"
        :icon="isCodeVisible ? 'chevronUp' : 'codeToggle'"
        tooltip="Toggle code visibility"
        @click="toggleCodeVisibility"
      />
    </div>

    <!-- Code examples -->
    <div v-if="presentTabs.length && isCodeVisible">
      <KTabs
        :tabs="presentTabs"
        :tabsId="exampleId"
        ariaLabel="Language blocks for the Vue component"
      >
        <!-- Template -->
        <template #template>
          <div v-if="$slots.html">
            <slot name="html"></slot>
          </div>
          <DocsShowCode
            v-else-if="codeBlocks.html"
            language="html"
          >
            {{ codeBlocks.html }}
          </DocsShowCode>
        </template>

        <!-- Script -->
        <template #script>
          <div v-if="$slots.javascript || codeBlocks.javascript">
            <slot name="javascript">
              <DocsShowCode language="javascript">
                {{ codeBlocks.javascript }}
              </DocsShowCode>
            </slot>
          </div>
        </template>

        <!-- Style -->
        <template #style>
          <div v-if="$slots.scss || codeBlocks.scss">
            <slot name="scss">
              <DocsShowCode language="scss">
                {{ codeBlocks.scss }}
              </DocsShowCode>
            </slot>
          </div>
        </template>
      </KTabs>
    </div>

    <!-- Rendering the component itself -->
    <KTransition kind="component-fade-out-in">
      <KCircularLoader v-if="show(exampleId, !isLoaded, MINIMUM_LOADER_TIME)" />
      <div v-else>
        <slot>
          <component :is="loadedComponent" />
        </slot>
      </div>
    </KTransition>
  </div>

</template>


<script>

  import useKShow from '../../lib/composables/useKShow';

  export default {
    name: 'DocsExample',
    setup() {
      const { show } = useKShow();
      return { show, MINIMUM_LOADER_TIME: 300 };
    },
    props: {
      /**
       * Path to the Vue component file to be displayed as example
       * The path should be relative to the 'docs/examples/' directory
       * @type {String}
       * @example 'KComponent/Variant.vue'
       */
      loadExample: {
        type: String,
        required: false,
        default: null,
      },
      /*
       * Unique identifier for the example. This must be unique within
       * the scope of the documentation page across all the DocsExample components.
       * @type {String}
       */
      exampleId: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        isCodeVisible: false,
        isLoaded: false,
        loadedComponent: null,
        codeBlocks: {},
      };
    },
    computed: {
      presentTabs() {
        const tabList = [];
        if (this.$slots.html || this.codeBlocks.html) {
          tabList.push({
            id: 'template',
            label: 'Template',
          });
        }

        if (this.$slots.javascript || this.codeBlocks.javascript) {
          tabList.push({
            id: 'script',
            label: 'Script',
          });
        }

        if (this.$slots.scss || this.codeBlocks.scss) {
          tabList.push({
            id: 'style',
            label: 'Style',
          });
        }

        return tabList;
      },
      toggleButtonStyle() {
        return {
          marginBottom: this.isCodeVisible ? '0' : '12px',
        };
      },
    },
    created() {
      if (this.loadExample) {
        Promise.all([this.loadComponentCode(), this.loadComponent()]).then(() => {
          this.isLoaded = true;
        });
      } else {
        this.isLoaded = true;
      }
    },
    methods: {
      toggleCodeVisibility() {
        this.isCodeVisible = !this.isCodeVisible;
      },
      /*
       * Loads the component file as raw source code and then parses
       * the same for template, script and style tag content
       */
      async loadComponentCode() {
        try {
          const content = await import(`!!raw-loader!@/examples/${this.loadExample}?raw`);
          this.codeBlocks = this.parseTemplate(content.default);
        } catch (error) {
          throw new Error(`Failed to load component code: ${error}`);
        }
      },
      /*
       * Loads the component file as a Vue component
       * and sets the loaded component to the data properties
       */
      async loadComponent() {
        try {
          const component = await import(`../examples/${this.loadExample}`);
          this.loadedComponent = component.default;
        } catch (error) {
          throw new Error(`Failed to load component: ${error}`);
        }
      },
      /*
       * Extracts the content between the opening and closing tags of the specified target
       * @param {string} content - The content to extract from
       * @param {string} target - The target tag to extract content from
       * @returns {string | null} - The content between the opening and closing tags
       */
      applyRegex(content, target) {
        const pattern = new RegExp(`(<${target}(\\s[^>]*)?>)([\\w\\W]*)(<\\/${target}>)`, 'g');
        const parsed = pattern.exec(content);
        if (!parsed) {
          return null;
        }
        // Extract the content between the first opening and the last closing tags
        return parsed[3].trim();
      },
      /*
       * Parses the content of the component file into separate code blocks for template, script, and style.
       * @param {string | null} content - The content of the component file
       * @returns {Object} - An object describing the code blocks
       */
      parseTemplate(content) {
        if (!content) {
          return {};
        }

        const codeBlocks = {};

        const template = this.applyRegex(content, 'template');
        if (template) {
          codeBlocks.html = template;
        }

        const script = this.applyRegex(content, 'script');
        if (script) {
          codeBlocks.javascript = script;
        }

        const style = this.applyRegex(content, 'style');
        if (style) {
          codeBlocks.scss = style;
        }

        return codeBlocks;
      },
    },
  };

</script>


<style scoped>

  .docs-example {
    padding: 20px;
    padding-top: 0;
    margin-bottom: 24px;
  }

  .code-toggle-button {
    display: flex;
    justify-content: flex-end;
  }

</style>
