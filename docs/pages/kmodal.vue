<template>

  <DocsPageTemplate apiDocs>
    <DocsPageSection
      title="Overview"
      anchor="#overview"
    >
      For design guidance, see the page on
      <DocsInternalLink
        href="/modals"
        text="modals"
      />.
    </DocsPageSection>
    <DocsPageSection
      title="Usage"
      anchor="#usage"
    >
      <DocsSubNav
        :items="[
          { text: 'With description', href: '#description' },
          { text: 'With enabled / disabled submit', href: '#enabled-disabled-submit' },
          { text: 'With predefined sizes', href: '#predefined-sizes' },
          { text: 'With precise size', href: '#precise-size' },
          { text: 'With custom actions', href: '#custom-actions' },
        ]"
      />

      <h3>
        With description
        <DocsAnchorTarget anchor="#description" />
      </h3>
      <p>To show information, warnings, or notifications.</p>
      <DocsExample
        loadExample="KModal/ModalWithDescription.vue"
        exampleId="description"
      />

      <h3>
        With enabled / disabled submit
        <DocsAnchorTarget anchor="#enabled-disabled-submit" />
      </h3>
      <p>Modal with checkbox, submit, and cancel buttons.</p>
      <DocsExample
        loadExample="KModal/ModalWithSubmitCancel.vue"
        exampleId="enabled-disabled-submit"
      />

      <h3>
        With predefined sizes
        <DocsAnchorTarget anchor="#predefined-sizes" />
      </h3>
      <p>There are three predefined modal sizes.</p>
      <DocsExample
        loadExample="KModal/ModalWithDifferentSizes.vue"
        exampleId="predefined-sizes"
        :hideStyle="true"
        block
      />

      <h3>
        With precise size
        <DocsAnchorTarget anchor="#precise-size" />
      </h3>
      <p>Modal with 600px width.</p>
      <DocsExample
        loadExample="KModal/ModalWithDynamicWidth.vue"
        exampleId="precise-size"
      />

      <h3>
        With custom actions
        <DocsAnchorTarget anchor="#custom-actions" />
      </h3>
      <p>Use <code>actions</code> slot to override the default buttons.</p>
      <DocsExample
        loadExample="KModal/ModalWithCustomActions.vue"
        exampleId="custom-actions"
      />
    </DocsPageSection>
  </DocsPageTemplate>

</template>


<script>

  export default {};

</script>


<style lang="scss" scoped></style>
