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
      <p>
        The component supports theme tokens for proper color theming, flexible slot-based content
        placement, and accessibility features. Use KToolbar to replace Vuetify's VToolbar and
        maintain design consistency across your Kolibri apps.
      </p>
    </DocsPageSection>

    <DocsPageSection
      title="Usage"
      anchor="#usage"
    >
      <!-- Example 1: Light theme with close icon -->
      <h3>Light Theme Toolbar</h3>
      <p>
        This example demonstrates a toolbar with light theme colors using
        <code>$themeTokens.appBar</code> background and <code>$themeTokens.text</code>
        color, with a close icon in the icon slot.
      </p>

      <DocsExample exampleId="ktoolbar-light-theme">
        <KToolbar
          title="Page Title"
          textColor="black"
          :style="{ backgroundColor: $themeTokens.appBar }"
        >
          <template #icon>
            <KIconButton
              icon="close"
              :color="$themeTokens.text"
              :ariaLabel="'Close'"
            />
          </template>
        </KToolbar>

        <template #html>
          <DocsShowCode language="html">
            <KToolbar
              title="Page Title"
              textColor="black"
              :style="{ backgroundColor: $themeTokens.appBar }"
            />
          </DocsShowCode>
        </template>

      </DocsExample>

      <!-- Example 2: Dark theme with back icon in router-link -->
      <h3>Dark Theme Toolbar with Router Navigation</h3>
      <p>
        This example shows a dark-themed toolbar using
        <code>$themeTokens.appBarDark</code> background and
        <code>$themeTokens.textInverted</code> color, with a back navigation button wrapped in
        router-link.
      </p>

      <DocsExample exampleId="ktoolbar-dark-theme">
        <KToolbar
          title="Page Title"
          textColor="white"
          :style="{ backgroundColor: $themeTokens.appBarDark }"
        >
          <template #icon>
            <router-link
              to="/"
              style="display: inline-block; border-radius: 50%"
            >
              <KIconButton
                icon="back"
                :color="$themeTokens.textInverted"
                :ariaLabel="'Go back'"
              />
            </router-link>
          </template>
        </KToolbar>

        <template #html>
          <DocsShowCode language="html">
            <KToolbar
              title="Page Title"
              textColor="white"
              :style="{ backgroundColor: $themeTokens.appBarDark }"
            />
          </DocsShowCode>
        </template>

      </DocsExample>
    </DocsPageSection>
  </DocsPageTemplate>

</template>
