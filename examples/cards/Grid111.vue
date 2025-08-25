<template>

  <KCardGrid
    layout="1-1-1"
    :skeletonsConfig="skeletonsConfig"
    :loading="loading"
  >
    <Card
      v-for="i in 2"
      :key="i"
      :headingLevel="5"
      orientation="horizontal"
      :prependTitle="`(${i})`"
    />
  </KCardGrid>

</template>


<script>

  import Card from './Card';

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
            height: '220px',
            orientation: 'horizontal',
            thumbnailDisplay: 'large',
            thumbnailAlign: 'left',
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
