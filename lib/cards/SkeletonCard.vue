<template>

  <KCard
    isSkeleton
    aria-hidden="true"
    :style="{ height: height }"
    :layout="layout"
    :thumbnailDisplay="thumbnailDisplay"
    :thumbnailAlign="thumbnailAlign"
  />

</template>

<script>

  export default {
    name: 'SkeletonCard',
    props: {
      height: {
        required: false,
        type: String,
        default: '300px',
      },
      // same as KCard's 'layout'
      layout: {
        required: false,
        type: String,
        default: 'horizontal',
      },
      // same as KCard's 'thumbnailDisplay'
      thumbnailDisplay: {
        required: false,
        type: String,
        default: 'none',
      },
      // same as KCard's 'thumbnailAlign'
      thumbnailAlign: {
        required: false,
        type: String,
        default: 'left',
      },
    },
  };

</script>

<style lang="scss" scoped>

</style>