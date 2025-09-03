<template>

  <DocsPageTemplate>
    <DocsPageSection
      title="Intro"
      anchor="#intro"
    >
      <p>
        This work aims to resolve various problems with floating elements, such as difficulties in
        adding new features, performance, accessibility, technical debt, and upgrade issues. It has
        two parts:
      </p>

      <h3>(1)</h3>
      <p>In the short term, it focuses on tooltips and includes:</p>

      <ul>
        <li>
          Addition of <code>useKFloatingInteraction</code> and
          <code>useKFloatingPosition</code> composables.
        </li>
        <li>
          Removal of
          <code>vue-popper</code> from <code>KTooltip</code> in favor of the composables.
        </li>
        <li>
          Removal of <code>UiTooltip</code> and <code>tippy.js</code> from
          <code>KIconButton</code> in favor of <code>KTooltip</code>.
        </li>
        <li>
          Adding <code>lazy</code> rendering and event delegation options to <code>KTooltip</code>.
        </li>
        <li>
          Only one third-party dependency used, solely for low-level position calculations, in the
          above <code>K</code> components.
        </li>
        <li>First documented patterns for accessible tooltips.</li>
      </ul>

      <h3>(2)</h3>
      <p>
        It attempts to address the above in a way that opens up a path to easier implementation of
        any floating features in the long term. This second part is more of a vision, as well as a
        test for ease of use and scalability of the solution for the issues above. It includes:
      </p>

      <ul>
        <li>
          <code>useKFloatingInteraction</code> and <code>useKFloatingPosition</code> manage all our
          floating logic—both KDS (dropdown menus, context menus, ...) and non-KDS.
        </li>
        <li>
          Removal of <code>UiTooltip</code>, <code>UiPopover</code>, and <code>tippy.js</code> from
          all KDS components.
        </li>
        <li>Fully accessible floating elements implemented everywhere.</li>
        <li>Only one third-party dependency everywhere.</li>
      </ul>

      <br >

      <p>
        The demos below related to (1) are fairly close to what may be the final version, while
        those for (2) are just quick drafts.
      </p>

      <p>
        See the pull request description for implementation details, performance considerations,
        browser support, and the choice of third-party library.
      </p>
    </DocsPageSection>

    <DocsPageSection
      title="Terms"
      anchor="#terms"
    >
      <ul>
        <li>
          <i>Trigger element</i> is the element that a user interacts with to activate a floating
          element.
        </li>
        <li>
          <i>Floating element</i> appears or disappears in response to user interaction with the
          trigger element.
        </li>
        <li>
          <i>Anchor element</i> is the element to which a floating element is anchored. It is often
          the same as the trigger element, but not always.
        </li>
      </ul>
    </DocsPageSection>

    <DocsPageSection
      title="useKFloatingPosition"
      anchor="#useKFloatingPosition"
    >
      <ul>
        <li>Positions a floating element relative to its anchor element.</li>
        <li>Abstracts away the third-party positioning library.</li>
        <li>Can be used both within and outside of KDS.</li>
        <li>
          Can be used together with <code>useKFloatingInteraction</code>, or separately in cases
          where <code>useKFloatingInteraction</code> is not suitable (see the context menu example).
        </li>
      </ul>

      <!-- eslint-disable -->
      <!-- prettier-ignore -->
      <DocsShowCode language="javascript">
        const { initPosition, disablePosition, destroyPosition } = useKFloatingPosition();
        
        // Positions a floating element relative to the anchor element.
        initPosition(floatingId, floatingEl, anchorEl, options);

        // Disables position updates for the floating element.
        disablePosition(floatingId);

        // Destroys position instance associated with the floating element.
        destroyPosition(floatingElId);
      </DocsShowCode>
      <!-- eslint-enable -->
    </DocsPageSection>

    <DocsPageSection
      title="useKFloatingInteraction"
      anchor="#useKFloatingInteraction"
    >
      <ul>
        <li>
          Observes user interactions with trigger elements to determine when the floating element
          should be considered active. Trigger elements are identified by the
          <code>data-floating-id</code> attribute, which matches the ID of the associated floating
          element.
        </li>
        <li>Can be used both within and outside of KDS.</li>
        <li>
          It does not directly set visibility, allowing components to manage it depending on
          context.
        </li>
        <li>
          Has several optimizations to minimize performance impact, particularly on pages with large
          numbers of trigger elements.
        </li>
        <li>Typically called from a Vue component that represents a floating element.</li>
      </ul>

      <!-- eslint-disable -->
      <!-- prettier-ignore -->
      <DocsShowCode language="javascript">
      setup() {
        // Returns:
        //
        // `isActive` is a computed property indicating if the floating element
        //            is active (= user interacted with its trigger element
        //            in the way specified by `activateOn`)
        //
        // `triggerEl` is the trigger element associated with this floating element 
        // 
        const { isActive, triggerEl } = useKFloatingInteraction(
          floatingId,    // Floating element ID

          activateOn,    // Optional. Array of interactions that activate the floating element.
                         // Supported interactions: 'hover', 'touch', 'focus', 'keyboardfocus'.
                         // Default: ['hover', 'touch', 'focus'].

          delegateTo     // Optional. 'root' or ID of the element to delegate events to.
                         // 'root' delegates events to the document or window.
                         // If not provided, events will be attached to the trigger element.
                         // Used to optimize performance on pages with many floating elements.
        )
      }
      </DocsShowCode>
      <!-- eslint-enable -->
    </DocsPageSection>

    <DocsPageSection
      title="KTooltip"
      anchor="#tooltip"
    >
      <p>
        <code>vue-popper</code> has been removed from <code>KTooltip</code>, which is now built with
        <code>useKFloatingInteraction</code> and <code>useKFloatingPosition</code>. It provides the
        same features as before, plus a few new ones used in the examples below—such as lazy
        rendering, event delegation, configurable interactions, and the option to define an anchor
        different from the trigger element.
      </p>

      <p>
        Compared to the previous version of <code>KTooltip</code>, the connection between the
        trigger element and its tooltip is now established using the
        <code>data-floating-id</code> attribute, which matches the tooltip's ID. This allows for
        important performance optimizations (see implementation notes in the pull request
        description), in comparison with the current version eliminates the need for several extra
        props, and aligns with how <code>aria-labelledby</code> /
        <code>aria-describedby</code> reference IDs, allowing for reuse of the same ID.
      </p>

      <p>
        Note: Examples below furthermore experiment with the new <code>v-focusable</code> directive
        which is used to make any element focusable so that the tooltip can be displayed to keyboard
        users.
      </p>

      <DocsShow>
        <div :style="{ margin: '18px' }">
          <KIcon
            v-focusable
            data-floating-id="ex-tooltip"
            aria-labelledby="ex-tooltip"
            icon="help"
            :color="$themePalette.blue.v_500"
            :style="{ marginLeft: '8px' }"
          />
          <KTooltipNext
            id="ex-tooltip"
            text="Tooltip text"
            :activateOn="['hover', 'focus', 'touch']"
          />
        </div>
      </DocsShow>

      <DocsShowCode language="html">
        <KIcon
          v-focusable
          data-floating-id="tooltip"
          aria-labelledby="tooltip"
        />
        <KTooltip
          id="tooltip"
          text="Tooltip text"
          :activateOn="['hover', 'focus', 'touch']"
        />
      </DocsShowCode>

      <p>
        However, typically our tooltips are not standalone, but provide additional information about
        the element they are attached to, such as a heading, form field, etc. To balance the needs
        of sighted keyboard users and screen reader users, the following pattern may be interesting:
      </p>

      <DocsShow>
        <div :style="{ display: 'flex', alignItems: 'center' }">
          <h4
            v-focusable
            data-floating-id="ex-tooltip-formats"
            aria-describedby="ex-tooltip-formats"
          >
            Captions and subtitles

            <KIcon
              id="ex-help-icon"
              aria-hidden
              icon="help"
              :color="$themePalette.blue.v_500"
              :style="{ marginLeft: '8px' }"
            />
          </h4>

          <KTooltipNext
            id="ex-tooltip-formats"
            text="Supported formats: '.vtt'"
            anchorId="ex-help-icon"
            :activateOn="['hover', 'focus', 'touch']"
          />
        </div>
      </DocsShow>

      <DocsShowCode language="html">
        <h4
          v-focusable
          data-floating-id="tooltip-formats"
          aria-describedby="tooltip-formats"
        >
          Captions and subtitles

          <KIcon
            id="help-icon"
            aria-hidden
          />
        </h4>

        <KTooltip
          id="tooltip-formats"
          text="Supported formats: '.vtt'"
          anchorId="help-icon"
          :activateOn="['hover', 'focus', 'touch']"
        />
      </DocsShowCode>

      <p>
        Here, since the tooltip provides additional context about the heading,
        <code>aria-describedby</code> is used on the heading itself. Furthermore, the heading is
        focusable, allowing keyboard users to access the tooltip. The heading is the trigger
        element, while the icon is the anchor. Finally, the icon is hidden from assistive
        technologies. Compared to other techniques, this approach prevents the tooltip text from
        being announced multiple times, while still allowing sighted keyboard users to access it.
      </p>
    </DocsPageSection>

    <DocsPageSection
      title="Lazy KTooltip"
      anchor="#lazy"
    >
      <DocsShow>
        <div :style="{ display: 'flex', alignItems: 'center' }">
          <h4
            v-focusable
            data-floating-id="ex-tooltip-formats-lazy"
            aria-description="Supported formats: '.vtt'"
          >
            Captions and subtitles

            <KIcon
              id="ex-help-icon-lazy"
              aria-hidden
              icon="help"
              :color="$themePalette.blue.v_500"
              :style="{ marginLeft: '8px' }"
            />
          </h4>

          <KTooltipNext
            id="ex-tooltip-formats-lazy"
            text="Supported formats: '.vtt'"
            anchorId="ex-help-icon-lazy"
            :activateOn="['hover', 'focus', 'touch']"
            lazy
          />
        </div>
      </DocsShow>

      <p>
        Lazy rendering is for pages with many tooltips to prevent performance problems. Unlike
        regular tooltips, lazy tooltips are not immediately present in the DOM, so using
        <code>aria-labelledby</code> or <code>aria-describedby</code> does not work correctly.
        Instead, <code>aria-label</code> or <code>aria-description</code> is a better choice.
      </p>

      <DocsShowCode language="html">
        <h4
          v-focusable
          data-floating-id="tooltip-formats"
          aria-description="Supported formats: '.vtt'"
        >
          Captions and subtitles

          <KIcon
            id="help-icon"
            aria-hidden
          />
        </h4>

        <KTooltip
          id="tooltip-formats"
          text="Supported formats: '.vtt'"
          anchorId="help-icon"
          :activateOn="['hover', 'focus', 'touch']"
          lazy
        />
      </DocsShowCode>
    </DocsPageSection>

    <DocsPageSection
      title="KTooltip with delegated events"
      anchor="#delegated"
    >
      <DocsShowCode language="html">
        <h4
          v-focusable
          data-floating-id="tooltip-formats"
          aria-description="Supported formats: '.vtt'"
        >
          Captions and subtitles

          <KIcon
            id="help-icon"
            aria-hidden
          />
        </h4>

        <KTooltip
          id="tooltip-formats"
          text="Supported formats: '.vtt'"
          anchorId="help-icon"
          lazy
          delegateTo="root"
        />
      </DocsShowCode>

      <p>
        To further improve performance, in addition to lazy rendering, events can be delegated. In
        this example, event listeners are attached to the root (document or window) rather than to
        the trigger element. This can significantly help on pages with many tooltips by reducing the
        number of event listeners and associated memory usage. For example, instead of having
        <code>mouseenter</code> and <code>focus</code> listeners for every trigger element on a page
        with hundreds, event delegation results in only two event listeners on the page.
      </p>

      <p>
        However, on pages with only a few tooltips, delegation may not be desirable, as it causes
        handlers to run on more elements than necessary. The general rule of thumb is to avoid
        delegation for a small number of tooltips on a page. For larger numbers of tooltips, it's
        best to profile performance with and without delegation to choose the optimal approach.
      </p>

      <p>
        Besides delegating to the root, ID of any element can be used as the delegation target. This
        is useful when many tooltips are children of a container smaller than the
        document—delegating to the container prevents unnecessary execution of handlers elsewhere in
        the document.
      </p>

      <p>See implementation notes in the pull request description for details.</p>
    </DocsPageSection>

    <DocsPageSection
      title="KLabeledIcon with KTooltip"
      anchor="#labeled-icon"
    >
      <DocsShow>
        <KLabeledIcon
          v-focusable
          data-floating-id="ex-tooltip-coach"
          aria-describedby="ex-tooltip-coach"
          :style="{ width: 'initial', marginLeft: '8px', color: $themeTokens.coachContent }"
        >
          <template #icon>
            <KIcon
              icon="coach"
              :color="$themeTokens.coachContent"
            />
          </template>
          <span>9</span>
        </KLabeledIcon>

        <KTooltipNext
          id="ex-tooltip-coach"
          placement="right"
          :activateOn="['hover', 'focus', 'touch']"
        >
          Contains 9 coach resources
        </KTooltipNext>
      </DocsShow>

      <DocsShowCode language="html">
        <KLabeledIcon
          v-focusable
          data-floating-id="tooltip-coach"
          aria-describedby="tooltip-coach"
        >
          <template #icon>
            <KIcon icon="coach" />
          </template>
          <span>9</span>
        </KLabeledIcon>

        <KTooltip
          id="tooltip-coach"
          placement="right"
          :activateOn="['hover', 'focus', 'touch']"
        >
          Contains 9 coach resources
        </KTooltip>
      </DocsShowCode>
    </DocsPageSection>

    <DocsPageSection
      title="KIconButton with KTooltip"
      anchor="#icon-button"
    >
      <p>
        <code>KIconButton</code> has been refactored to use <code>KTooltip</code> under the hood
        instead of <code>UiTooltip</code> and <code>tippy.js</code>. There are no changes to its
        public interface, and the tooltip appearance and transition are now consistent with those of
        non-button tooltips.
      </p>

      <DocsShow>
        <KIconButton
          :tooltip="isBookmarked ? 'Remove bookmark' : 'Add bookmark'"
          :icon="isBookmarked ? 'bookmark' : 'bookmarkEmpty'"
          @click="isBookmarked = !isBookmarked"
        />
      </DocsShow>

      <DocsShowCode language="html">
        <KIconButton
          :tooltip="isBookmarked ? 'Remove bookmark' : 'Add bookmark'"
          :icon="isBookmarked ? 'bookmark' : 'bookmarkEmpty'"
          @click="isBookmarked = !isBookmarked"
        />
      </DocsShowCode>

      <p>
        The <code>tooltip</code> prop serves as a shortcut for simple use cases. When more advanced
        features or customization of <code>KTooltip</code> are needed, <code>KTooltip</code> can be
        used as usual.
      </p>

      <DocsShow>
        <KIconButton
          data-floating-id="ex-tooltip-bookmark"
          aria-labelledby="ex-tooltip-bookmark"
          :icon="isBookmarked ? 'bookmark' : 'bookmarkEmpty'"
          @click="isBookmarked = !isBookmarked"
        />
        <KTooltipNext
          id="ex-tooltip-bookmark"
          :text="isBookmarked ? 'Remove bookmark' : 'Add bookmark'"
          :activateOn="['hover', 'focus', 'touch']"
          placement="right"
        />
      </DocsShow>

      <DocsShowCode language="html">
        <KIconButton
          data-floating-id="tooltip-bookmark"
          aria-labelledby="tooltip-bookmark"
          :icon="isBookmarked ? 'bookmark' : 'bookmarkEmpty'"
          @click="isBookmarked = !isBookmarked"
        />
        <KTooltip
          id="tooltip-bookmark"
          :text="isBookmarked ? 'Remove bookmark' : 'Add bookmark'"
          placement="right"
          :activateOn="['hover', 'focus', 'touch']"
          lazy
        />
      </DocsShowCode>
    </DocsPageSection>

    <DocsPageSection
      title="KTextbox with KTooltip"
      anchor="#textbox"
    >
      <DocsShow block>
        <!--
          TODO Investigate flickering of hidden non-lazy that overlaps
          with its trigger that can be reproduced on this example
          on smaller screen sizes. And/or perhaps better ensure that tooltips
          don't overlap with triggers.
        -->
        <KTextbox
          label="Aggregator"
          :maxlength="200"
          tooltip="Website or org hosting the content collection but not necessarily the creator or copyright holder."
        />
      </DocsShow>

      <p>
        Here, motivated by Studio use cases, I am experimenting with the new
        <code>tooltip</code> prop for <code>KTextbox</code>, which displays an info icon with a
        large touch area and a tooltip next to the input field.
      </p>

      <DocsShowCode language="html">
        <KTextbox
          label="Aggregator"
          :maxlength="200"
          tooltip="Website or org hosting the content collection but not necessarily the creator or copyright holder."
        />
      </DocsShowCode>

      <p>
        It aims to provide a good experience for all mouse, keyboard, and screen reader users, and
        serves as a test for more complex implementations built with <code>KTooltip</code> (and
        therefore <code>useKFloating...</code> composables). Here is what the structure looks like
        under the hood of <code>KTextbox</code>:
      </p>

      <DocsShowCode language="html">
        <input
          data-floating-id="tooltip-input"
          aria-describedby="tooltip-input"
        >
        <svg
          id="info-icon"
          aria-hidden
          data-floating-id="tooltip-icon"
        />
        <KTooltip
          id="tooltip-input"
          :activateOn="['keyboardfocus']"
          anchorId="info-icon"
          text="Website or org hosting the content collection but not necessarily the creator or copyright holder."
          :disabled="startedTyping"
        />
        <KTooltip
          id="tooltip-icon"
          :activateOn="['hover', 'touch']"
          text="Website or org hosting the content collection but not necessarily the creator or copyright holder."
        />
      </DocsShowCode>

      <ul>
        <li>
          The <code>input</code> is associated with the first tooltip, which is activated only when
          the input is focused using the keyboard, since showing a tooltip when hovering over or
          clicking the input with a mouse would be unusual and potentially distracting.
          <code>anchorId</code> is used to position the tooltip relative to the help icon, rather
          than the input itself. Finally, <code>disabled</code> is used to hide the tooltip when the
          user starts typing.
        </li>
        <li>
          The <code>svg</code> icon is associated with the second tooltip, which is activated only
          when the icon is hovered over or touched. This tooltip is never disabled.
        </li>
      </ul>
    </DocsPageSection>

    <DocsPageSection
      title="Context menu"
      anchor="#context-menu"
    >
      <p>Click in the area below using the right and left mouse button.</p>

      <DocsShow block>
        <div :style="{ height: '200px' }">
          <KContextMenu>
            <p>Floating within floating...</p>
            <KIcon
              v-focusable
              data-floating-id="ex-tooltip-menu"
              aria-describedby="ex-tooltip-menu"
              icon="help"
              :color="$themePalette.blue.v_500"
              :style="{ marginLeft: '8px' }"
            />
            <KTooltipNext
              id="ex-tooltip-menu"
              placement="bottom"
              :activateOn="['hover', 'focus', 'touch']"
            >
              ...is one last tooltip
            </KTooltipNext>
          </KContextMenu>
        </div>
      </DocsShow>

      <p>
        Just a quick exploration of how context menus could be positioned by integrating virtual
        element, <code>useKFloatingPosition</code>, and existing <code>useKContextMenu</code>. This
        would also help us eventually move away from <code>UiPopover</code> and
        <code>tippy.js</code> in KDS menu components. See <code>lib/KContextMenu.vue</code>.
      </p>
    </DocsPageSection>
  </DocsPageTemplate>

</template>


<script>

  import KTooltipNext from '../../lib/KTooltip/next';

  export default {
    components: {
      KTooltipNext,
    },
    data() {
      return {
        isBookmarked: false,
      };
    },
  };

</script>


<style lang="scss" scoped>

  // TODO update `generateGlobalStyles` and use
  // inputTrackingModality and theme to achieve
  // this on elements with `v-focusable`

  [data-focus]:focus {
    outline: 3px solid #33acf5;
    outline-offset: 4px;
  }

  [data-focus]:focus:not(:focus-visible) {
    outline: none;
  }

  [data-floating-id] {
    cursor: pointer;
  }

</style>
