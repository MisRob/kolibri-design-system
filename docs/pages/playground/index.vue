<template>

  <!--
    Playground: A private page for components development
    *****************************************************
    Place a component you're working on here and see it
    live on http://localhost:4000/playground

    Please do not commit your local updates of this file.
  -->
  <div style="padding: 24px">
    <CardsVisualTest />
  </div>

</template>


<script>

  import CardsVisualTest from '../../../lib/cards/__tests__/components/CardsVisualTest.vue';

  /*
    Playground is a Vue component too,
    so you can also use `data`, `methods`, etc.
    as usual if helpful
  */
  export default {
    name: 'Playground',
    components: {
      CardsVisualTest,
    },
    data() {
      return {};
    },
    methods: {},
  };

</script>
