<template>

  <!--
    do not use @onmouseup but rather @click
    to allow for @click.stop on buttons and similar
    rendered within a card via its slots -->
  <li
    :class="['k-card', $slots.select ? 'with-selection-controls' : undefined]"
    :style="[gridItemStyle, focusStyle]"
    @focus="onFocus"
    @mouseenter="onHover"
    @mousedown="onMouseDown"
    @click="onClick"
    @keyup.enter="onEnter"
  >
    <div
      :class="['card-area', ...cardAreaClasses ]"
      :style="{ backgroundColor: $themeTokens.surface }"
    >
      <div class="upper-card-area">
        <div class="around-title">
          <!--
        Utilizing `visuallyhidden`, `aria-labelledby`,
        and `aria-hidden` to ensure:
        - More reliable output for some screen readers
          in both link and non-link cards
        - Prevents undesired screen reader announcements
          when title is customized via the `title` slot
      -->
          <span :id="`card-title-${_uid}`" class="visuallyhidden">
            {{ title }}
          </span>
          <component
            :is="headingElement"
            class="heading"
            :style="{ color: $themeTokens.text }"
          >
            <!--
              `event=""` prevents router-link click event
              (technique used by Vue community because
              the usual ways don't work for router-link).
              This is to
                - (1) prevent double navigation (the wrapping
                      <li> is supposed to take care of navigation)
                - (2) together with the `draggable` disabled, 
                      ensures that text selection works on
                      the title text (see the feature for allowing
                      selecting card's content in `onClick`)
            -->
            <router-link
              v-if="to"
              event=""
              :to="to"
              draggable="false"
              class="title"
              :aria-labelledby="`card-title-${_uid}`"
              @focus.native="onTitleFocus"
              @blur.native="onTitleBlur"
            >
              <span aria-hidden="true">
                <!-- @slot A scoped slot via which the `title` can be customized. Provides the `titleText` attribute.-->
                <slot 
                  v-if="$scopedSlots.title"
                  name="title"
                  :titleText="title"
                ></slot>
                <KTextTruncator
                  v-else
                  :text="title"
                  :maxLines="titleMaxLines"
                />
              </span>
            </router-link>
            <!--
              Set tabindex to 0 to make title focusable so we
              can use the same focus ring logic like when title
              is a router-link. Relatedly set data-focus so that
              the trackInputModality can set modality to keyboard
              to make the focus ring display correctly
              -->
            <span
              v-else
              tabindex="0"
              data-focus="true"
              class="title"
              :aria-labelledby="`card-title-${_uid}`"
              @focus="onTitleFocus"
              @blur="onTitleBlur"
            >
              <span aria-hidden="true">
                <!-- @slot A scoped slot via which the `title` can be customized. Provides the `titleText` attribute. -->
                <slot 
                  v-if="$scopedSlots.title"
                  name="title"
                  :titleText="title"
                ></slot>
                <KTextTruncator
                  v-else
                  :text="title"
                  :maxLines="titleMaxLines"
                />
              </span>
            </span>
          </component>

          <div
            v-if="hasAboveTitleArea"
            data-test="aboveTitle"
            class="above-title"
          >
            <!-- @slot Places content to the area above the title. -->
            <slot name="aboveTitle"></slot>
          </div>

          <div
            v-if="hasBelowTitleArea"
            data-test="belowTitle"
            class="below-title"
            :style="{ color: $themeTokens.annotation }"
          >
            <!-- @slot Places content to the area below the title. -->
            <slot name="belowTitle"></slot>
          </div>
        </div>

        <div
          v-if="thumbnailDisplay !== ThumbnailDisplays.NONE"
          class="thumbnail"
        >
          <!-- 
            Render KImg even if thumbnailSrc is not provided since in that case
            KImg takes care of showing the gray placeholder area.
          -->
          <KImg
            data-test="thumbnail-img"
            :src="thumbnailSrc"
            :scaleType="thumbnailScaleType"
            :aspectRatio="thumbnailAspectRatio"
            :isDecorative="true"
            :appearanceOverrides="thumbnailStyles"
            @error="onThumbnailError"
          />
          <span
            v-if="!thumbnailSrc || thumbnailError"
            class="thumbnail-placeholder"
          >
            <!-- @slot Places content to the thumbnail placeholder area. -->
            <slot name="thumbnailPlaceholder"></slot>
          </span>
        </div>
      </div>

      <div
        v-if="hasFooterArea"
        data-test="footer"
        class="footer"
      >
        <!-- @slot Places content to the footer area. -->
        <slot name="footer"></slot>
      </div>
    </div>
    <!--
      .stop modifier on keyup.enter and click events
      to ensure that navigation doesn't occur when
      a selection control is pressed or clicked
    -->
    <div
      v-if="$slots.select"
      class="selection-control"
      @keyup.enter.stop
      @click.stop
    >
      <!-- @slot For selection controls such as checkbox or radio button -->
      <slot name="select"></slot>
    </div>
  </li>

</template>


<script>

  import { inject } from '@vue/composition-api';

  const Orientations = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
  };

  const ThumbnailDisplays = {
    NONE: 'none',
    SMALL: 'small',
    LARGE: 'large',
  };

  const ThumbnailAlignOptions = {
    LEFT: 'left',
    RIGHT: 'right',
  };

  function cardValidator(allowedValues, propName) {
    return function(value) {
      if (!Object.values(allowedValues).includes(value)) {
        throw new Error(
          `Invalid ${propName} value: '${value}'. Allowed values are: ${Object.values(
            allowedValues
          ).join(', ')}`
        );
      }
      return true;
    };
  }

  export default {
    name: 'KCard',
    setup() {
      // provided by `KCardGrid`
      // controls the width and layout of `KCard` items in the grid
      const gridItemStyle = inject('gridItemStyle');

      return {
        gridItemStyle,
      };
    },
    props: {
      /**
       * HTML heading level in range (h2 - h6) for the title
       */
      headingLevel: {
        type: Number,
        required: true,
        validator(value) {
          if (value <= 6 && value >= 2) {
            return true;
          } else {
            console.error(`[KCard] 'headingLevel' must be between 2 and 6.`);
            return false;
          }
        },
      },
      /**
       * A Vue route object. If provided, card click
       * will navigate to the target.
       */
      to: {
        type: Object,
        required: false,
        default: null,
      },
      /**
       * Card title
       */
      title: {
        type: String,
        required: true,
        default: null,
      },
      /**
       * Truncates title lines
       */
      titleMaxLines: {
        type: Number,
        required: false,
        default: 2,
      },
      /**
       * Controls card orientation.
       * Options: `'horizontal'`, `'vertical'`.
       */
      orientation: {
        type: String,
        default: 'horizontal',
        validator: cardValidator(Orientations, 'orientation'),
      },
      /**
       * Controls if and how the thumbnail appears in the card.
       * Options: `'none'`, `'small'`, or `'large'`.
       * */
      thumbnailDisplay: {
        type: String,
        default: 'none',
        validator: cardValidator(ThumbnailDisplays, 'thumbnailDisplay'),
      },
      /**
       * Thumbnail source path.
       **/
      thumbnailSrc: {
        type: String,
        required: false,
        default: null,
      },
      /**
       * Specifies how the thumbnail scales in the card.
       * Options: `'centerInside'`, `'contain'`, `'fitXY'`.
       */
      thumbnailScaleType: {
        type: String,
        default: 'centerInside',
      },
      /**
       * Controls the alignment of the thumbnail area
       * in horizontal card orientation.
       * Options: `'left'`, `'right'`
       */
      thumbnailAlign: {
        type: String,
        default: 'left',
        validator: cardValidator(ThumbnailAlignOptions, 'thumbnailAlign'),
      },
      /**
       * If `aboveTitle` slot is empty, controls
       * whether its space is preserved or not.
       */
      preserveAboveTitle: {
        type: Boolean,
        default: false,
      },
      /**
       * If `belowTitle` slot is empty, controls
       * whether its space is preserved or not.
       */
      preserveBelowTitle: {
        type: Boolean,
        default: false,
      },
      /**
       * If `footer` slot is empty, controls
       * whether its space is preserved or not.
       */
      preserveFooter: {
        type: Boolean,
        default: false,
      },
      /**
       * Private. Do not use.
       */
      // Disables validations and functionality
      // that shouldn't be present when card
      // used as loading skeleton via `SkeletonCard`
      isSkeleton: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        mouseDownTime: 0,
        ThumbnailDisplays,
        isTitleFocused: false,
        thumbnailError: false,
      };
    },
    computed: {
      focusStyle() {
        return this.isTitleFocused ? this.$coreOutline : {};
      },
      hasAboveTitleArea() {
        return this.$slots.aboveTitle || this.preserveAboveTitle;
      },
      hasBelowTitleArea() {
        return this.$slots.belowTitle || this.preserveBelowTitle;
      },
      hasFooterArea() {
        return this.$slots.footer || this.preserveFooter;
      },
      headingElement() {
        return this.headingLevel ? 'h' + this.headingLevel : undefined;
      },
      cardAreaClasses() {
        return this.stylesAndClasses.cardAreaClasses;
      },
      thumbnailAspectRatio() {
        return this.stylesAndClasses.thumbnailAspectRatio;
      },
      thumbnailStyles() {
        return this.stylesAndClasses.thumbnailStyles;
      },
      /*
        A source-of-truth that organizes styles and classes by layout combinations
        to aid understanding of what is applied exactly to each layout.

        Alongside other configurations, contains dynamic styles that <style>
        can't handle. Whenever possible, prioritize using <style> over dynamic styles
        since our RTL framework can't pick dynamic styles. Make sure to use 'isRtl'
        when adding dynamic styles related to alignment.
      */
      stylesAndClasses() {
        const thumbnailCommonStyles = {
          width: '100%',
          height: '100%',
        };

        if (
          this.orientation === Orientations.VERTICAL &&
          this.thumbnailDisplay === ThumbnailDisplays.LARGE
        ) {
          return {
            cardAreaClasses: ['vertical-with-large-thumbnail'],
            thumbnailAspectRatio: undefined,
            thumbnailStyles: {
              ...thumbnailCommonStyles,
              borderRadius: '8px 8px 0 0',
            },
          };
        }

        if (
          this.orientation === Orientations.VERTICAL &&
          this.thumbnailDisplay === ThumbnailDisplays.SMALL
        ) {
          return {
            cardAreaClasses: ['vertical-with-small-thumbnail'],
            thumbnailAspectRatio: undefined,
            thumbnailStyles: {
              ...thumbnailCommonStyles,
              borderRadius: '4px',
            },
          };
        }

        if (
          this.orientation === Orientations.VERTICAL &&
          this.thumbnailDisplay === ThumbnailDisplays.NONE
        ) {
          return {
            cardAreaClasses: ['vertical-with-none-thumbnail'],
            thumbnailAspectRatio: undefined,
            thumbnailStyles: undefined,
          };
        }

        if (
          this.orientation === Orientations.HORIZONTAL &&
          this.thumbnailDisplay === ThumbnailDisplays.LARGE
        ) {
          return {
            cardAreaClasses: [
              'horizontal-with-large-thumbnail',
              `thumbnail-align-${this.thumbnailAlign}`,
            ],
            thumbnailAspectRatio: undefined,
            thumbnailStyles: {
              ...thumbnailCommonStyles,
              borderRadius: this.thumbnailAlign === 'right' ? '0 8px 8px 0' : '8px 0 0 8px',
            },
          };
        }

        if (
          this.orientation === Orientations.HORIZONTAL &&
          this.thumbnailDisplay === ThumbnailDisplays.SMALL
        ) {
          return {
            cardAreaClasses: [
              'horizontal-with-small-thumbnail',
              `thumbnail-align-${this.thumbnailAlign}`,
            ],
            thumbnailAspectRatio: '1:1',
            thumbnailStyles: {
              ...thumbnailCommonStyles,
              borderRadius: '8px',
            },
          };
        }

        if (
          this.orientation === Orientations.HORIZONTAL &&
          this.thumbnailDisplay === ThumbnailDisplays.NONE
        ) {
          return {
            cardAreaClasses: ['horizontal-with-none-thumbnail'],
            thumbnailAspectRatio: undefined,
            thumbnailStyles: undefined,
          };
        }

        return {};
      },
    },
    methods: {
      onTitleFocus() {
        if (this.isSkeleton) {
          return;
        }
        this.isTitleFocused = true;
      },
      onTitleBlur() {
        this.isTitleFocused = false;
      },
      onThumbnailError() {
        this.thumbnailError = true;
      },
      clickHandler(event) {
        /**
         * Emitted when a card is clicked or pressed with enter.
         * Contains the DOM event in the payload.
         */
        this.$emit('click', event);
        if (this.to) {
          this.$router.push(this.to);
        }
      },
      onFocus(e) {
        /**
         * Emitted when a card gets focus
         */
        this.$emit('focus', e);
      },
      onHover(e) {
        /**
         * Emitted when a card is hovered
         */
        this.$emit('hover', e);
      },
      onEnter(event) {
        this.clickHandler(event);
      },
      onMouseDown() {
        this.mouseDownTime = new Date().getTime();
      },
      onClick(event) {
        if (this.isSkeleton) {
          return;
        }
        const mouseUpTime = new Date().getTime();
        // Make textual content selectable within the whole clickable card area.
        //
        // Calculate the time difference between the mouse button press and release.
        // If the time difference is greater than or equal to 200 milliseconds,
        // it means that the mouse button was pressed and held for a longer time,
        // which is not typically interpreted as a click event so do not run
        // the click handler.
        if (mouseUpTime - this.mouseDownTime < 200) {
          this.clickHandler(event);
        } else {
          return;
        }
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '../styles/definitions';

  $spacer: 16px;

  /************* Common styles **************/

  .k-card {
    width: 100%;
    padding: 0;
    margin: 0;
    font-size: 12px;
    text-align: left;
    text-decoration: none;
    list-style-type: none;
    cursor: pointer;

    &.with-selection-controls {
      display: flex;
      flex-direction: row-reverse;
      align-items: center;

      .selection-control {
        margin-right: 20px;
      }
    }
  }

  .card-area {
    @extend %dropshadow-2dp;

    display: flex;
    flex-direction: column;
    justify-content: space-between; // push footer to the bottom of the card
    width: 100%;
    height: 100%;
    border-radius: 0.5em;
    outline-offset: -1px;
    transition: box-shadow $core-time ease;

    &:hover,
    &:focus {
      @extend %dropshadow-6dp;
    }
  }

  .heading {
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;
  }

  .title {
    display: inline-block; // allows title placeholder in the skeleton card
    width: 100%; // allows title placeholder in the skeleton card
    color: inherit;
    text-decoration: none;
    outline: none; // the focus ring is moved to the whole <li>
  }

  // Because the title and the areas above and below it
  // are grouped together in all layoyts, abstract them
  // into one whole here. Simplifies common spacing
  // styles as well as layout-specific styles.
  .around-title {
    display: flex;
    flex-direction: column;

    .heading {
      order: 2;
    }

    .above-title {
      order: 1;
    }

    .below-title {
      order: 3;
    }
  }

  /************* Spacing *************/

  // first reset
  .around-title,
  .heading,
  .above-title,
  .below-title,
  .footer {
    padding: 0;
    margin: 0;
  }

  /* stylelint-disable no-duplicate-selectors */
  .around-title {
    padding: $spacer;
  }
  /* stylelint-enable no-duplicate-selectors */

  .footer {
    padding: 0 $spacer $spacer $spacer;
  }

  .above-title {
    padding-bottom: calc(#{$spacer} / 2);
  }

  .below-title {
    padding-top: calc(#{$spacer} / 2);
  }

  /************* Thumbnail **************/

  /* stylelint-disable no-duplicate-selectors */
  .thumbnail {
    position: relative; /* for absolute positioning of .thumbnail-placeholder  */
  }
  /* stylelint-enable no-duplicate-selectors */

  .thumbnail-placeholder {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 0; /* <img> in KImg with z-index 1 should cover the placeholder after loaded */
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  /************* Layout-specific styles *************/

  .vertical-with-large-thumbnail {
    .upper-card-area {
      display: flex;
      flex-direction: column;
    }

    .thumbnail {
      order: 1;
      height: 180px;
    }

    .around-title {
      order: 2;
    }
  }

  .vertical-with-small-thumbnail {
    /* stylelint-disable scss/at-extend-no-missing-placeholder */
    @extend .vertical-with-large-thumbnail;
    /* stylelint-enable scss/at-extend-no-missing-placeholder */

    .thumbnail {
      height: calc(180px - #{$spacer});
      margin: $spacer $spacer 0;
    }
  }

  .horizontal-with-small-thumbnail {
    .upper-card-area {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
    }

    .thumbnail {
      width: 30%;
      margin-top: $spacer;
      margin-bottom: $spacer;
    }

    .around-title {
      width: 70%;
    }

    &.thumbnail-align-left {
      .thumbnail {
        order: 1;
        margin-left: $spacer;
      }

      .around-title {
        order: 2;
      }
    }

    &.thumbnail-align-right {
      .thumbnail {
        order: 2;
        margin-right: $spacer;
      }

      .around-title {
        order: 1;
      }
    }
  }

  .horizontal-with-large-thumbnail {
    // override few styles from .horizontal-with-small-thumbnail
    // to stretch the thumbnail to the full height of the card

    /* stylelint-disable scss/at-extend-no-missing-placeholder */
    @extend .horizontal-with-small-thumbnail;
    /* stylelint-enable scss/at-extend-no-missing-placeholder */

    &.card-area {
      position: relative; /* for absolute positioning of .thumbnail  */
    }

    .thumbnail {
      position: absolute;
      width: 40%;
      height: 100%;
      margin-top: 0;
      margin-bottom: 0;
    }

    .around-title,
    .footer {
      width: 60%;
    }

    &.thumbnail-align-left {
      .thumbnail {
        left: 0;
        margin-left: 0;
      }

      .around-title,
      .footer {
        margin-left: auto;
      }
    }

    &.thumbnail-align-right {
      .thumbnail {
        right: 0;
        margin-right: 0;
      }

      .around-title,
      .footer {
        margin-right: auto;
      }
    }
  }

</style>