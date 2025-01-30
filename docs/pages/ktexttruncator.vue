<template>

  <DocsPageTemplate :apiDocs="true">
    <DocsPageSection
      title="Overview"
      anchor="#overview"
    >
      <p>Truncates the text to a certain number of lines and adds an ellipsis character "…".</p>
      <DocsShow>
        <p>
          <KTextTruncator
            text="This is a long text that will be truncated to two line. This is a long text that will be truncated to two line. This is a long text that will be truncated to two line. This is a long text that will be truncated to two line. This is a long text that will be truncated to two line."
            :maxLines="2"
          />
        </p>
      </DocsShow>
    </DocsPageSection>
    <DocsPageSection
      title="Usage"
      anchor="#usage"
    >
      <p>
        Use <code>KTextTruncator</code> to shorten long text while keeping it readable. It limits
        the text to a specific number of lines and adds an ellipsis (<code>...</code>) when the text
        overflows.
      </p>

      <p>By default, text truncates to one line if <code>maxLines</code> is not set.</p>

      <h3>Customizing the Number of Lines</h3>
      <p>Use <code>maxLines</code> to control the number of lines before truncation.</p>
      <DocsShow>
        <p>
          <KTextTruncator
            text="This text is too long to fit in the available space. It truncates after three lines instead of two.This text is too long to fit in the available space. This text truncates after three lines instead of two.This text is too long to fit in the available space.This text truncates after three lines instead of two.This text is too long to fit in the available space. It truncates after three lines instead of two."
            :maxLines="3"
          />
        </p>
      </DocsShow>
      <DocsShowCode language="html">
        <KTextTruncator
          text="This text is too long to fit in the available space. It truncates after three lines instead of two.This text is too long to fit in the available space. This text truncates after three lines instead of two.This text is too long to fit in the available space.This text truncates after three lines instead of two.This text is too long to fit in the available space. It truncates after three lines instead of two."
          :maxLines="3"
        />
      </DocsShowCode>
    </DocsPageSection>
  </DocsPageTemplate>

</template>
