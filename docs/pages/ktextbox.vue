<template>

  <DocsPageTemplate apiDocs>
    <DocsPageSection
      title="Overview"
      anchor="#overview"
    >
      For detailed design guidance, refer to the page on
      <DocsInternalLink
        href="/textfields"
        text="text fields"
      />.
    </DocsPageSection>

    <DocsPageSection
      title="Usage"
      anchor="#usage"
    >
      <h3>Input with label</h3>
      <DocsExample
        loadExample="KTextbox/Label.vue"
        exampleId="ktextbox-label"
        block
      />
      <p>
        This text box includes a visible label, providing clear guidance and context to the user
        about the expected input.
      </p>

      <h3>Valid and invalid input</h3>
      <DocsExample
        loadExample="KTextbox/Validation.vue"
        exampleId="ktextbox-validation"
        block
      />
      <p>
        This text box only accepts numeric input. If any non-numeric character is entered, it will
        be considered invalid.
      </p>

      <h3>Character limit</h3>
      <DocsExample
        loadExample="KTextbox/CharacterLimit.vue"
        exampleId="ktextbox-charlimit"
        block
      />
      <p>
        This text box has a maximum character limit of 20. It displays a character counter to inform
        the user of the remaining characters they can enter.
      </p>

      <h3>Disabled input</h3>
      <DocsExample
        loadExample="KTextbox/Disabled.vue"
        exampleId="ktextbox-disabled"
        block
      />
      <p>
        This text box is disabled. It cannot be edited or focused, so it will be skipped during
        keyboard navigation.
      </p>

      <h3>Readonly input</h3>
      <DocsExample
        loadExample="KTextbox/Readonly.vue"
        exampleId="ktextbox-readonly"
        block
      />
      <p>
        This text box is readonly. It cannot be edited but it can still select and copy the text.
        It's also included in keyboard navigation.
      </p>

      <h3>Number input</h3>
      <DocsExample
        loadExample="KTextbox/Number.vue"
        exampleId="ktextbox-number"
        block
      />
      <p>
        This is a numeric input field where users can input values within the range of 0 to 100.
      </p>
      <p>
        <strong>Note:</strong> The KTextbox does not automatically validate the min and max values,
        however, it is recommended to use them for accessibility purposes while using the invalid
        and invalidText props to handle validation as needed.
      </p>

      <h3>Text area</h3>
      <DocsExample
        loadExample="KTextbox/Textarea.vue"
        exampleId="ktextbox-textarea"
        block
      />
      <p>This is a multi-line text input area, suitable for longer text entries.</p>
    </DocsPageSection>
  </DocsPageTemplate>

</template>
