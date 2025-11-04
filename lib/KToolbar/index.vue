<template>

  <div
    class="k-toolbar"
    :class="classes"
    :style="toolbarStyles"
  >
    <div class="k-toolbar-left">
      <div
        v-if="$slots.icon"
        class="k-toolbar-nav-icon"
      >
        <!-- @slot For the navigation icon -->
        <slot name="icon"> </slot>
      </div>

      <div
        v-if="brand || $slots.brand"
        class="k-toolbar-brand"
      >
        <!-- @slot Brand area. Shows brand text by default. -->
        <slot name="brand">
          <div class="k-toolbar-brand-text">
            {{ brand }}
          </div>
        </slot>
      </div>

      <!-- @slot Main content area. Shows the title by default. -->
      <slot>
        <div
          v-if="title"
          class="k-toolbar-title"
        >
          {{ title }}
        </div>
      </slot>

      <div
        v-if="$slots.navigation"
        class="k-toolbar-nav"
      >
        <!-- @slot Navigation links or menu items area. -->
        <slot name="navigation"></slot>
      </div>
    </div>

    <div class="k-toolbar-right">
      <!-- @slot Action buttons or secondary controls area. -->
      <slot name="actions"></slot>
    </div>
  </div>

</template>


<script>

  export default {
    name: 'KToolbar',

    props: {
      /**
       * Controls the toolbar appearance and styling. Options:
       * - `'default'`: `$themeTokens.surface` background with shadow
       * - `'clear'`: Transparent background with shadow
       */
      type: {
        type: String,
        default: 'default',
        validator(value) {
          return ['default', 'clear'].includes(value);
        },
      },
      /**
       * Text color. Default is `$themeTokens.text`.
       */
      textColor: {
        type: String,
        default: null,
      },
      /**
       * Background color
       */
      backgroundColor: {
        type: String,
        default: null,
      },
      /**
       * The main title text displayed in the toolbar
       */
      title: {
        type: String,
        default: '',
      },
      /**
       * Brand text displayed alongside the title in the left area
       */
      brand: {
        type: String,
        default: '',
      },
      /**
       * Whether the toolbar has elevated shadow styling
       */
      raised: {
        type: Boolean,
        default: true,
      },
    },

    computed: {
      classes() {
        return [`k-toolbar--type-${this.type}`, { 'is-raised': this.raised }];
      },
      toolbarStyles() {
        const styles = {
          textColor: this.$themeTokens.text,
        };
        if (this.type === 'default') {
          styles.backgroundColor = this.$themeTokens.surface;
        }
        if (this.backgroundColor) {
          styles.backgroundColor = this.backgroundColor;
        }
        if (this.textColor) {
          styles.color = this.textColor;
        }
        return styles;
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '../styles/definitions';

  .k-toolbar {
    position: relative;
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: space-between;
    max-width: 100%;
    height: 3.5rem;
    padding: 0 16px;
    font-family: inherit;
    font-size: 1.125rem;

    &.is-raised {
      @extend %dropshadow-2dp;
    }

    &:not(.is-raised).k-toolbar--type-default {
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
  }

  .k-toolbar-left {
    display: flex;
    align-items: center;
    margin-left: 16px;
  }

  .k-toolbar-nav-icon {
    margin-right: 8px;
    margin-left: -16px;
  }

  .k-toolbar-nav {
    display: flex;
    align-items: baseline;
    margin-right: 8px;
    margin-left: 16px;
  }

  .k-toolbar-brand {
    min-width: inherit;
  }

  .k-toolbar-brand-text {
    flex-grow: 1;
    padding-right: 8px;
  }

  .k-toolbar-right {
    display: inline-block;
  }

  .k-toolbar-title {
    overflow: hidden;
    white-space: nowrap;
  }

  .k-toolbar--type-clear {
    background-color: transparent;
    border: 0;
    box-shadow: none;
  }

</style>
