<template>

  <DocsPageTemplate apiDocs>
    <DocsPageSection
      title="Overview"
      anchor="#overview"
    >
      <p>
        A toolbar component designed for app bars and navigation. It provides structure for
        displaying a title, navigation, and action buttons.
      </p>
    </DocsPageSection>

    <DocsPageSection
      title="Usage"
      anchor="#usage"
    >
      <h3>Light theme</h3>

      <p>Uses the light app bar theme token.</p>

      <DocsExample
        loadExample="KToolbar/LightTheme.vue"
        exampleId="ktoolbar-light-theme"
        block
      />

      <h3>Dark theme</h3>

      <p>Uses the dark app bar theme token.</p>

      <DocsExample
        loadExample="KToolbar/DarkTheme.vue"
        exampleId="ktoolbar-dark-theme"
        block
      />

      <h3>Navigation and actions</h3>

      <DocsExample
        loadExample="KToolbar/NavigationAndActions.vue"
        exampleId="ktoolbar-navigation-and-actions"
        block
      />

      <h3>Brand area</h3>

      <DocsExample
        loadExample="KToolbar/Brand.vue"
        exampleId="ktoolbar-brand"
        block
      />
    </DocsPageSection>
  </DocsPageTemplate>

</template>
