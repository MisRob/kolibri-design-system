<template>

  <DocsPageTemplate apiDocs>
    <DocsPageSection
      title="Overview"
      anchor="#overview"
    >
      <p>
        A composable that observes user interactions with activator elements to determine when a
        floating element should be considered active. Activator elements are identified by the
        <code>data-floating-id</code> attribute, which matches the ID of the associated floating
        element.
      </p>

      <p>
        The composable does not directly set visibility, leaving components to manage it depending
        on context. It can be used both within and outside of the design system, typically together
        with
        <DocsLibraryLink component="useKFloatingPosition" />.
      </p>

      <p>
        See
        <DocsInternalLink
          href="/floatingelements"
          text="Floating elements"
        />.
      </p>
    </DocsPageSection>

    <DocsPageSection
      title="Usage"
      anchor="#usage"
    >
      <DocsSubNav
        :items="[
          { text: 'Basic usage', href: '#basic-usage' },
          { text: 'Interaction types', href: '#interaction-types' },
          { text: 'Performance optimization', href: '#performance-optimization' },
        ]"
      />

      <h3 id="basic-usage">Basic usage</h3>
      <p>
        Add a <code>data-floating-id</code> attribute to the activator element. Its value must match
        the <code>floatingId</code> passed to <code>useKFloatingInteraction</code>. Use the returned
        <code>isActive</code> ref to conditionally show the floating element. When positioning the
        floating element, pass <code>activatorEl.value</code> as the anchor.
      </p>

      <!-- eslint-disable -->
      <!-- prettier-ignore -->
      <DocsShowCode language="javascript">
        import useKFloatingInteraction from 'kolibri-design-system/lib/composables/useKFloatingInteraction';

        const { isActive, activatorEl } = useKFloatingInteraction('my-tooltip');

        // isActive.value is true when the user hovers the activator (default)
        // activatorEl.value holds the activator Element when isActive.value is true
      </DocsShowCode>
      <!-- eslint-enable -->

      <p>Hover the button to show the tooltip.</p>
      <DocsExample
        exampleId="basic"
        loadExample="useKFloatingInteraction/Basic.vue"
        block
      />

      <h3 id="interaction-types">Interaction types</h3>
      <p>
        The optional <code>activateOn</code> parameter controls which user interactions activate the
        floating element. Supported values: <code>'hover'</code>, <code>'touch'</code>,
        <code>'focus'</code>, <code>'keyboardfocus'</code>, <code>'click'</code>. Defaults to
        <code>['hover']</code>.
      </p>
      <p>
        <code>'keyboardfocus'</code> activates the floating element only when the user navigates
        with the keyboard, not when they click with a mouse. <code>'click'</code> toggles the
        floating element on each click of the activator.
      </p>

      <!-- eslint-disable -->
      <!-- prettier-ignore -->
      <DocsShowCode language="javascript">
        import useKFloatingInteraction from 'kolibri-design-system/lib/composables/useKFloatingInteraction';

        // Activate on click (toggle)
        const { isActive } = useKFloatingInteraction('my-tooltip', ['click']);

        // Activate on keyboard focus only
        const { isActive } = useKFloatingInteraction('my-tooltip', ['keyboardfocus']);

        // Activate on multiple interactions
        const { isActive } = useKFloatingInteraction('my-tooltip', ['hover', 'focus']);
      </DocsShowCode>
      <!-- eslint-enable -->

      <p>Click the button to toggle the tooltip.</p>
      <DocsExample
        exampleId="click"
        loadExample="useKFloatingInteraction/Click.vue"
        block
      />

      <h3 id="performance-optimization">Performance optimization</h3>
      <p>
        The optional <code>delegateTo</code> parameter lets you delegate events to a common ancestor
        element instead of attaching listeners to each activator element directly. Use this to
        optimize performance on pages with many floating elements.
      </p>
      <p>
        Pass <code>'root'</code> to delegate to the document (or window for focus events), or pass
        the ID of a common ancestor element.
      </p>

      <!-- eslint-disable -->
      <!-- prettier-ignore -->
      <DocsShowCode language="javascript">
        import useKFloatingInteraction from 'kolibri-design-system/lib/composables/useKFloatingInteraction';

        // All three share a single mouseenter listener on 'my-container'
        const { isActive: isActive1 } = useKFloatingInteraction('tooltip-1', ['hover'], 'my-container');
        const { isActive: isActive2 } = useKFloatingInteraction('tooltip-2', ['hover'], 'my-container');
        const { isActive: isActive3 } = useKFloatingInteraction('tooltip-3', ['hover'], 'my-container');
      </DocsShowCode>
      <!-- eslint-enable -->

      <p>
        Hover each button to show its tooltip. All three share a single event listener on the
        container.
      </p>
      <DocsExample
        exampleId="delegation"
        loadExample="useKFloatingInteraction/Delegation.vue"
        block
      />
    </DocsPageSection>

    <DocsPageSection
      title="Related"
      anchor="#related"
    >
      <ul>
        <li>
          <DocsInternalLink
            href="/floatingelements"
            text="Floating elements"
          />
          has general overview of floating elements
        </li>
        <li><DocsLibraryLink component="useKFloatingPosition" /></li>
        <li>
          <DocsExternalLink
            href="https://floating-ui.com/docs/getting-started"
            text="Floating UI"
          />
        </li>
      </ul>
    </DocsPageSection>
  </DocsPageTemplate>

</template>


<script>

  export default {};

</script>
