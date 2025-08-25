<template>

  <KCardGrid
    layout="1-2-3"
    :skeletonsConfig="skeletonsConfig"
    :loading="loading"
  >
    <Card
      v-for="i in 5"
      :key="i"
      :headingLevel="5"
      :prependTitle="`(${i})`"
    />
  </KCardGrid>

</template>


<script>

  import Card from '../common/Card';

  export default {
    components: {
      Card,
    },
    data() {
      return {
        loading: true,
        skeletonsConfig: [
          {
            breakpoints: [0, 1, 2, 3, 4, 5, 6, 7],
            height: '380px',
            orientation: 'vertical',
            thumbnailDisplay: 'large',
          },
        ],
      };
    },
    mounted() {
      setTimeout(() => {
        this.loading = false;
      }, 3000);
    },
  };

</script>
