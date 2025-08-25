<template>

  <KCardGrid layout="1-2-3">
    <KCard
      v-for="{ display } in thumbnailCombinations"
      :key="`${display}`"
      :headingLevel="3"
      orientation="vertical"
      :thumbnailDisplay="display"
      :thumbnailSrc="require('../common/hummingbird-large-cc-by-sa-4.jpg')"
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

</template>


<script>

  export default {
    data() {
      return {
        thumbnailCombinations: [
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
