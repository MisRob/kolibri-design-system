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
        type.
      </p>

      <p>
        The cost of delegation is fixed and tiny; the cost of not delegating grows with the number
        of floating elements. Below roughly a hundred on a page it doesn't matter; above that,
        delegate.
      </p>

      <p>In more detail, the main points to consider:</p>

      <ul>
        <li>
          A delegated listener runs for every event of its type anywhere on the page. For
          <code>'click'</code>, <code>'touch'</code>, and <code>'focus'</code> these events are
          rare, so sharing one listener is a pure win.
        </li>
        <li>
          <code>'hover'</code> is the frequent one: delegating it costs an activator element lookup
          on every <code>mouseenter</code> anywhere on the page. In practice this is negligible, as
          the <code>data-floating-id</code> check lets the handler exit immediately on elements that
          aren't activators.
        </li>
        <li>
          Without delegation, every floating element attaches its own activation listeners, and the
          internal observation of activator elements stays on for as long as any non-delegated
          floating element is mounted, doing work proportional to their number on every DOM change
          on the page. Both costs grow with the number of floating elements, while the cost of
          delegation stays the same.
        </li>
        <li>
          On pages where the choice could matter, it's best to profile with and without delegation
          and compare.
        </li>
      </ul>

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
