<template>

  <div class="docs-example">
    <div class="code-toggle-button">
      <KIconButton
        appearance="raised-button"
        :icon="isCodeVisible ? 'chevronUp' : 'codeToggle'"
        tooltip="Toggle code visibility"
        @click="toggleCodeVisibility"
      />
    </div>

    <div v-show="isCodeVisible">
      <!-- Template Tag -->
      <div v-if="$slots.html">
        <slot name="html"></slot>
      </div>
      <DocsShowCode
        v-else-if="codeBlocks.html"
        language="html"
      >
        {{ codeBlocks.html }}
      </DocsShowCode>

      <!-- Script Tag -->
      <div v-if="$slots.javascript || codeBlocks.javascript">
        <slot name="javascript">
          <DocsShowCode language="javascript">
            {{ codeBlocks.javascript }}
          </DocsShowCode>
        </slot>
      </div>

      <!-- Style Tag -->
      <div v-if="$slots.scss || codeBlocks.scss">
        <slot name="scss">
          <DocsShowCode language="scss">
            {{ codeBlocks.scss }}
          </DocsShowCode>
        </slot>
      </div>
    </div>

    <!-- Rendering the component itself -->
    <div v-if="$slots.default">
      <slot></slot>
    </div>
    <div v-else-if="loadedComponent">
      <component :is="loadedComponent" />
    </div>
  </div>

</template>


<script>

  export default {
    name: 'DocsExample',
    props: {
      /**
       * Path to the Vue component file to be displayed as example
       * The path should be relative to the 'docs/examples/' directory
       * @type {String}
       * @example 'KTable/Base.vue'
       */
      loadExample: {
        type: String,
        required: false,
        default: null,
      },
    },
    data() {
      return {
        isCodeVisible: false,
        loadedComponent: null,
        codeBlocks: {},
      };
    },
    created() {
      if (this.loadExample) {
        this.loadComponentCode();
        this.loadComponent();
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
    margin-bottom: 16px;
  }

</style>
