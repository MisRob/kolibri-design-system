<template>

  <div class="visual-test-example">
    <div class="example-title">
      <p>{{ title }}</p>
    </div>
    <div
      :id="id"
      class="example-content"
      :style="{ width: width, height: height }"
    >
      <component
        :is="loadedComponent"
        v-bind="$attrs"
      />
    </div>
  </div>

</template>


<script>

  import { ref } from 'vue';

  /**
   * Displays an example of a visual test within a card-like container,
   * with the title displayed on top.
   */
  export default {
    name: 'VisualTestExample',
    inheritAttrs: false,
    setup(props) {
      const loadedComponent = ref(null);

      const loadComponent = async () => {
        const component = await import(`~~/examples/${props.loadExample}`);
        loadedComponent.value = component.default;
      };

      if (props.loadExample) {
        loadComponent();
      }

      return {
        loadedComponent,
      };
    },
    props: {
      /**
       * The title of the visual test example. This will be displayed on top of
       * the example content area.
       */
      title: {
        type: String,
        required: true,
      },
      /**
       * The width of the card container.
       */
      width: {
        type: String,
        default: null,
      },
      /**
       * The height of the card container.
       */
      height: {
        type: String,
        default: null,
      },
      /**
       * Path to the Vue component file to be displayed as example
       * The path should be relative to '/examples' directory.
       * @type {String}
       * @example 'KComponent/Variant.vue'
       */
      loadExample: {
        type: String,
        required: true,
        validator(value) {
          return value.endsWith('.vue');
        },
      },
      /**
       * The ID of the DOM node of the visual test example container.
       * Useful for querying the element in tests (e.g. to click it).
       */
      id: {
        type: String,
        default: null,
      },
    },
  };

</script>


<style lang="scss" scoped>

  .visual-test-example {
    .example-content {
      width: fit-content;
      padding: 16px;
      background-color: #ffffff;
      border: 1px solid #dddddd;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .example-title {
      p {
        margin-bottom: 2px;
        color: #777777;
      }
    }
  }

</style>
