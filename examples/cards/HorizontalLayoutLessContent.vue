<template>

  <KCardGrid layout="1-2-3">
    <KCard
      v-for="{ display, align } in thumbnailCombinations"
      :key="`${display}-${align}`"
      :headingLevel="3"
      :titleMaxLines="1"
      orientation="horizontal"
      :thumbnailDisplay="display"
      :thumbnailAlign="align"
      :thumbnailSrc="require('../common/hummingbird-large-cc-by-sa-4.jpg')"
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

</template>


<script>

  export default {
    data() {
      return {
        thumbnailCombinations: [
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
      };
    },
  };

</script>
