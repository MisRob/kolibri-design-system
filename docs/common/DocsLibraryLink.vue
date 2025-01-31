<template>

  <router-link :to="computedLink">
    <code>{{ component }}</code>
  </router-link>

</template>


<script>

  export default {
    name: 'DocsLibraryLink',
    props: {
      component: {
        type: String,
        required: true,
      },
    },
    computed: {
      computedLink() {
        // Preserve query parameters in the link
        return {
          path: '/' + this.component.toLowerCase(),
          query: { ...this.$route.query },
        };
      },
    },
  };

</script>
