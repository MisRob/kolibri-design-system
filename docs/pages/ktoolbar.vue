<template>

  <DocsPageTemplate apiDocs>
    <DocsPageSection
      title="Overview"
      anchor="#overview"
    >
      <p>
        KToolbar is a versatile toolbar component designed for app bars and navigation headers in
        Kolibri applications. It provides a consistent structure for displaying titles, navigation
        icons, and action buttons with customizable colors and styling options.
      </p>
    </DocsPageSection>

    <DocsPageSection
      title="Usage"
      anchor="#usage"
    >
      <!-- Example 1: Light theme with close icon -->
      <h3>Light theme toolbar</h3>
      <p>
        This example demonstrates a toolbar with light theme colors using
        <code>$themeTokens.appBar</code> background and <code>$themeTokens.text</code>
        color, with a close icon in the icon slot.
      </p>

      <DocsExample
        loadExample="KToolbar/LightTheme.vue"
        exampleId="ktoolbar-light-theme"
        block
      />

      <!-- Example 2: Dark theme with back icon in router-link -->
      <h3>Dark theme toolbar with router navigation</h3>
      <p>
        This example shows a dark-themed toolbar using
        <code>$themeTokens.appBarDark</code> background and
        <code>$themeTokens.textInverted</code> color, with a back navigation button wrapped in
        router-link.
      </p>

      <DocsExample
        loadExample="KToolbar/DarkTheme.vue"
        exampleId="ktoolbar-dark-theme"
        block
      />
    </DocsPageSection>
  </DocsPageTemplate>

</template>
