<template>

  <KCardGrid
    layout="1-2-2"
    :skeletonsConfig="skeletonsConfig"
    :loading="loading"
  >
    <Card
      v-for="i in 3"
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
  };

</script>
