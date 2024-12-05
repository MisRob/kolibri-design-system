<template>

  <div style="padding: 80px">
    <h1 id="link-target">
      Cards QA page
    </h1>
    <p>Also preview live examples on <code>KCardGrid</code> and <code>KCard</code> documentation pages.</p>

    <section>
      <h2>Horizontal cards with large amount of content</h2>

      <KCardGrid layout="1-2-3">
        <KCard
          v-for="{ display, align } in horizontalThumbnailCombinations"
          :key="`${display}-${align}`"
          :headingLevel="3"
          orientation="horizontal"
          :thumbnailDisplay="display"
          :thumbnailAlign="align"
          :thumbnailSrc="require('../../assets/hummingbird-large-cc-by-sa-4.jpg')"
          :title="`With thumbnail display: '${display}' and thumbnail align: '${align}'`"
        >
          <template #aboveTitle>
            <KLabeledIcon icon="readSolid" label="Read" />
          </template>
          <template #belowTitle>
            <KTextTruncator
              text="Discover how hummingbirds play a big role in nature despite their small size. Find out more about their beauty, how they help plants grow, and where they live."
              :maxLines="3"
            />
          </template>
          <template #footer>
            <div class="footer-wrapper">
              <div class="pills" :style="{ 'color': $themeTokens.annotation }">
                <span
                  :style="{ 'background-color': $themePalette.grey.v_100 }"
                >
                  <KIcon icon="readSolid" :style="{ fontSize: '13px', position: 'relative', top: '3px' }" />
                  Read
                </span>
                <span :style="{ 'background-color': $themePalette.grey.v_100 }">
                  Short Activity
                </span>
              </div>
            </div>
            <div :style="{ marginTop: '8px' }">
              <KFixedGrid :numCols="4">
                <KFixedGridItem :span="3" :style="{ paddingTop: '8px' }">
                  <KLinearLoader
                    type="determinate"
                    :progress="20"
                  />
                </KFixedGridItem>
                <KFixedGridItem :span="1" alignment="right">
                  <KIcon icon="schedule" :style="{ fontSize: '18px' }" />
                </KFixedGridItem>
              </KFixedGrid>
            </div>
          </template>
        </KCard>
      </KCardGrid>
    </section>

    <section>
      <h2>Horizontal cards with small amount of content</h2>
      <KCardGrid layout="1-2-3">
        <KCard
          v-for="{ display, align } in horizontalThumbnailCombinations"
          :key="`${display}-${align}`"
          :headingLevel="3"
          :titleMaxLines="1"
          orientation="horizontal"
          :thumbnailDisplay="display"
          :thumbnailAlign="align"
          :thumbnailSrc="require('../../assets/hummingbird-large-cc-by-sa-4.jpg')"
          :title="`With thumbnail display: '${display}' and thumbnail align: '${align}'`"
        >
          <template #belowTitle>
            <KTextTruncator
              text="Discover how hummingbirds play a big role in nature"
              :maxLines="1"
            />
          </template>
        </KCard>
      </KCardGrid>
    </section>

    <section>
      <h2>Vertical cards with large amount of content</h2>
      <KCardGrid layout="1-2-3">
        <KCard
          v-for="{ display } in verticalThumbnailCombinations"
          :key="`${display}`"
          :headingLevel="3"
          orientation="vertical"
          :thumbnailDisplay="display"
          :thumbnailSrc="require('../../assets/hummingbird-large-cc-by-sa-4.jpg')"
          :title="`With thumbnail display: '${display}'`"
        >
          <template #aboveTitle>
            <KLabeledIcon icon="readSolid" label="Read" />
          </template>
          <template #belowTitle>
            <KTextTruncator
              text="Discover how hummingbirds play a big role in nature despite their small size. Find out more about their beauty, how they help plants grow, and where they live."
              :maxLines="3"
            />
          </template>
          <template #footer>
            <div class="footer-wrapper">
              <div class="pills" :style="{ 'color': $themeTokens.annotation }">
                <span
                  :style="{ 'background-color': $themePalette.grey.v_100 }"
                >
                  <KIcon icon="readSolid" :style="{ fontSize: '13px', position: 'relative', top: '3px' }" />
                  Read
                </span>
                <span :style="{ 'background-color': $themePalette.grey.v_100 }">
                  Short Activity
                </span>
              </div>
            </div>
            <div :style="{ marginTop: '8px' }">
              <KFixedGrid :numCols="4">
                <KFixedGridItem :span="3" :style="{ paddingTop: '8px' }">
                  <KLinearLoader
                    type="determinate"
                    :progress="20"
                  />
                </KFixedGridItem>
                <KFixedGridItem :span="1" alignment="right">
                  <KIcon icon="schedule" :style="{ fontSize: '18px' }" />
                </KFixedGridItem>
              </KFixedGrid>
            </div>
          </template>
        </KCard>
      </KCardGrid>
    </section>

    <section>
      <h2>Vertical cards with small amount of content</h2>
      <KCardGrid layout="1-2-3">
        <KCard
          v-for="{ display } in verticalThumbnailCombinations"
          :key="`${display}`"
          :headingLevel="3"
          orientation="vertical"
          :thumbnailDisplay="display"
          :thumbnailSrc="require('../../assets/hummingbird-large-cc-by-sa-4.jpg')"
          :title="`With thumbnail display: '${display}'`"
        >
          <template #belowTitle>
            <KTextTruncator
              text="Discover how hummingbirds play a big role in nature"
              :maxLines="1"
            />
          </template>
        </KCard>
      </KCardGrid>
    </section>

    <section>
      <h2>Cards when links</h2>
      <KCardGrid layout="1-2-3">
        <KCard
          :to="{ path: '#link-target' }"
          :headingLevel="3"
          orientation="horizontal"
          :thumbnailSrc="require('../../assets/hummingbird-large-cc-by-sa-4.jpg')"
          title="First card"
        />
        <KCard
          :to="{ path: '#link-target' }"
          :headingLevel="3"
          orientation="horizontal"
          :thumbnailSrc="require('../../assets/hummingbird-large-cc-by-sa-4.jpg')"
          title="Second card"
        />
      </KCardGrid>
    </section>

    <section>
      <h2>Cards when not links</h2>
      <KCardGrid layout="1-2-3">
        <KCard
          :headingLevel="3"
          orientation="horizontal"
          :thumbnailSrc="require('../../assets/hummingbird-large-cc-by-sa-4.jpg')"
          title="First card"
        />
        <KCard
          :headingLevel="3"
          orientation="horizontal"
          :thumbnailSrc="require('../../assets/hummingbird-large-cc-by-sa-4.jpg')"
          title="Second card"
        />
      </KCardGrid>
    </section>
  </div>

</template>


<script>

  export default {
    name: 'QaCards',
    data() {
      return {
        horizontalThumbnailCombinations: [
          {
            display: 'none',
            align: 'left',
          },
          {
            display: 'small',
            align: 'left',
          },
          {
            display: 'large',
            align: 'left',
          },
          {
            display: 'none',
            align: 'right',
          },
          {
            display: 'small',
            align: 'right',
          },
          {
            display: 'large',
            align: 'right',
          },
        ],
        verticalThumbnailCombinations: [
          {
            display: 'none',
          },
          {
            display: 'small',
          },
          {
            display: 'large',
          },
        ],
      };
    },
  };

</script>


<style lang="scss" scoped>

  section {
    margin-top: 84px;
  }

  .footer-wrapper {
    display: flex;
    justify-content: space-between;
  }

  .pills {
    margin-left: -4px;

    span {
      display: inline-block;
      padding: 4px 8px;
      margin: 4px;
      border-radius: 4px;
    }
  }

</style>