<template>

  <DocsPageTemplate apiDocs>
    <DocsPageSection
      title="Overview"
      anchor="#overview"
    >
      <p>
        A composable that observes user interactions with activator elements to determine when a
        floating element should be considered active. It supports several interaction types, such as
        hover, click, and many others. It does not directly set visibility, leaving each
        implementation to manage it depending on context.
      </p>

      <p>
        Some design system components use it internally, but it can also be used independently,
        typically (but not necessarily) together with
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
          { text: 'Basic', href: '#basic' },
          { text: 'Interactions', href: '#interactions' },
          { text: 'Performance optimization', href: '#performance-optimization' },
        ]"
      />

      <h3 id="basic">Basic</h3>
      <p>
        First, add a <code>data-floating-id</code> attribute to the activator element. Its value
        must match the <code>floatingId</code> passed to <code>useKFloatingInteraction</code>. Then
        use the returned <code>isActive</code> computed property to conditionally show the floating
        element. Also set <code>:id="floatingId"</code> on the floating element itself, which is
        required: it is how interactions with the floating element are traced back to it.
      </p>

      <p>
        Pass a <code>ref</code> to the floating element as the second argument. It is what lets
        interactions with the floating element's own content be recognized as its own, rather than
        as interactions outside of it that should dismiss it. It may be populated lazily, as above,
        where the floating element is only rendered once active.
      </p>

      <p>
        <code>useKFloatingInteraction</code> also returns the activator element. This is useful when
        using it together with <code>useKFloatingPosition</code>, as you can pass it directly to
        <code>initPosition</code>.
      </p>

      <DocsExample
        exampleId="basic"
        loadExample="useKFloatingInteraction/Basic.vue"
        block
      />

      <h3 id="interactions">Interactions</h3>
      <p>By default, the floating element is activated on hover.</p>

      <p>
        The optional <code>activateOn</code> option controls which user interactions activate the
        floating element. Supported values are <code>'hover'</code>, <code>'touch'</code>,
        <code>'focus'</code>, <code>'click'</code>, and <code>'keyboardfocus'</code>.
        <code>'keyboardfocus'</code> activates the floating element only when the user navigates
        with the keyboard. Multiple interaction types can be passed.
      </p>

      <p>
        <code>'click'</code> and <code>'touch'</code> keep the floating element active until an
        interaction outside of it, rather than only while pressed.
      </p>

      <DocsExample
        exampleId="interactions"
        loadExample="useKFloatingInteraction/Interactions.vue"
        block
      />

      <h3 id="performance-optimization">Performance optimization</h3>
      <p>
        By default, activation events are listened for on the activator element itself. The optional
        <code>delegate</code> option listens for them on the document instead (or on the window, for
        focus events), so that all delegating floating elements share a single listener per event
        type. Use it on pages with many activator elements.
      </p>

      <p>
        The trade-off differs per interaction. Delegating <code>'click'</code>,
        <code>'focus'</code> and <code>'touch'</code> saves listeners at little cost, as their
        events are rare. Delegating <code>'hover'</code> saves listeners too, but its events are
        observed in the capture phase, so the activator element lookup runs on every
        <code>mouseenter</code> anywhere on the page.
      </p>

      <!-- eslint-disable -->
      <!-- prettier-ignore -->
      <DocsShowCode language="javascript">
        const { isActive, activatorEl } = useKFloatingInteraction(
          'my-tooltip',            // Unique ID of the floating element
          floatingRef,             // Vue ref to the floating element
          {
            activateOn: ['click'], // Interactions that activate it
            delegate: true,        // Listen on the document, not the activator
          }
        );
      </DocsShowCode>
      <!-- eslint-enable -->
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
        <li>
          <DocsLibraryLink component="useKFloatingPosition" /> manages the positioning of floating
          elements relative to their anchor elements
        </li>
      </ul>
    </DocsPageSection>
  </DocsPageTemplate>

</template>


<script>

  export default {};

</script>
