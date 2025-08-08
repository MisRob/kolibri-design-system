<template>

  <DocsPageTemplate apiDocs>
    <DocsPageSection
      title="Overview"
      anchor="#overview"
    >
      <p>
        Displays an icon. See
        <DocsInternalLink
          href="/icons"
          text="the page on icons"
        />
        for design guidance and a list of available icons.
      </p>

      <p>
        If an invalid icon is used, in development Vue.js validation will warn about the error. The
        icon will display as a broken image <KIcon icon="brokenImage" /> icon.
      </p>
    </DocsPageSection>

    <DocsPageSection
      title="Usage"
      anchor="#usage"
    >
      <DocsSubNav
        :items="[
          { text: 'Basic', href: '#basic' },
          { text: 'Color', href: '#color' },
          { text: 'Size', href: '#size' },
          { text: 'Responsive', href: '#responsive' },
        ]"
      />

      <section>
        <h3>
          Basic
          <DocsAnchorTarget anchor="#basic" />
        </h3>

        <p>
          Provide
          <DocsInternalLink
            href="/icons#icons"
            text="an icon token identifier"
          />
          via the <code>icon</code> prop.
        </p>

        <DocsExample
          loadExample="KIcon/Basic.vue"
          exampleId="kicon-basic"
        />
      </section>

      <section>
        <h3>
          Color
          <DocsAnchorTarget anchor="#color" />
        </h3>

        <p>
          Use the <code>color</code> prop to apply
          <DocsInternalLink
            href="/colors"
            text="a palette color."
          />
        </p>

        <DocsExample
          loadExample="KIcon/Color.vue"
          exampleId="kicon-color"
        />
      </section>

      <section>
        <h3>
          Size
          <DocsAnchorTarget anchor="#size" />
        </h3>

        <p>
          Set the icon size using <code>font-size</code> or <code>width</code> and
          <code>height</code> CSS properties.
        </p>

        <DocsExample
          loadExample="KIcon/Size.vue"
          exampleId="kicon-size"
        />
      </section>

      <section>
        <h3>
          Responsive
          <DocsAnchorTarget anchor="#responsive" />
        </h3>

        <p>
          The previous example can be adapted to create a responsive container with an icon that
          scales according to the container's size. Resize the browser window to see how the icon
          adjusts.
        </p>

        <DocsExample
          loadExample="KIcon/Responsive.vue"
          exampleId="kicon-responsive"
        />
      </section>
    </DocsPageSection>

    <DocsPageSection
      title="Related"
      anchor="#related"
    >
      <ul>
        <li>
          <DocsInternalLink
            href="/icons"
            text="Page on icons"
          />
          has design guidance and a list of available icons.
        </li>
      </ul>
    </DocsPageSection>
  </DocsPageTemplate>

</template>


<script>

  export default {};

</script>


<style lang="scss" scoped></style>
