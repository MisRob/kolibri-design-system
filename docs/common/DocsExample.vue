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
      <DocsShowCode
        v-for="(block, index) in codeBlocks"
        :key="index"
        :language="block.language"
      >
        {{ block.content }}
      </DocsShowCode>
    </div>

    <div>
      <!-- @slot Code example -->
      <slot></slot>
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
        loadedComponentCode: {},
      };
    },
    computed: {
      /*
       * Returns the code blocks for the template, script, and style of the loaded component
       * @returns {Array} - An array of code blocks
       */
      codeBlocks() {
        const {
          html: htmlExampleCode,
          js: jsExampleCode,
          scss: scssExampleCode,
        } = this.loadedComponentCode;
        const codeBlocks = [];

        const htmlBlockContent = this.$slots.html || htmlExampleCode;
        if (htmlBlockContent) {
          codeBlocks.push({
            language: 'html',
            content: htmlBlockContent,
            title: 'Template',
          });
        }

        const jsBlockContent = this.$slots.js || jsExampleCode;
        if (jsBlockContent) {
          codeBlocks.push({
            language: 'javascript',
            content: jsBlockContent,
            title: 'Script',
          });
        }

        const scssBlockContent = this.$slots.scss || scssExampleCode;
        if (scssBlockContent) {
          codeBlocks.push({
            language: 'scss',
            content: scssBlockContent,
            title: 'Style',
          });
        }

        return codeBlocks;
      },
    },
    created() {
      if (this.loadExample) {
        this.loadComponentData();
      }
    },
    methods: {
      toggleCodeVisibility() {
        this.isCodeVisible = !this.isCodeVisible;
      },
      /*
       * Loads the component file as raw source code and the component itself
       * and sets the loaded component and code to the data properties
       */
      async loadComponentData() {
        try {
          const content = await import(`!!raw-loader!@/examples/${this.loadExample}?raw`);
          this.loadedComponentCode = this.parseTemplate(content.default);

          const component = await import(`../examples/${this.loadExample}`);
          this.loadedComponent = component.default;
        } catch (error) {
          throw new Error(`Failed to load component content: ${error}`);
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
          codeBlocks.js = script;
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
