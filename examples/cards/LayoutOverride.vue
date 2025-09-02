<template>

  <KCardGrid
    layout="1-2-3"
    :layoutOverride="layoutOverride"
    :skeletonsConfig="skeletonsConfig"
    :loading="loading"
  >
    <Card
      v-for="i in 6"
      :key="i"
      :headingLevel="6"
      :prependTitle="`(${i})`"
      hideFooter
    />
  </KCardGrid>

</template>


<script>

  import Card from './Card';

  export default {
    components: {
      Card,
    },
    props: {
      /**
       * How long in seconds to simulate loading
       * state before displaying cards
       */
      loadFor: {
        type: Number,
        default: 3,
      },
    },
    data() {
      return {
        loading: this.loadFor > 0,
        layoutOverride: [
          {
            breakpoints: [0, 1],
            columnGap: '20px',
            rowGap: '20px',
          },
          {
            breakpoints: [4, 5, 6, 7],
            cardsPerRow: 4,
          },
        ],
        skeletonsConfig: [
          {
            breakpoints: [0, 1, 2, 3, 4, 5, 6, 7],
            orientation: 'vertical',
            thumbnailDisplay: 'large',
          },
        ],
      };
    },
    mounted() {
      if (this.loadFor > 0) {
        setTimeout(() => {
          this.loading = false;
        }, this.loadFor * 1000);
      }
    },
  };

</script>
