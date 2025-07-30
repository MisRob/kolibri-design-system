<template>

  <!--
    Playground: A private page for components development
    *****************************************************
    Place a component you're working on here and see it
    live on http://localhost:4000/playground

    Please do not commit your local updates of this file.
  -->
  <div style="padding: 24px">
    <!-- 
      Example: Uncomment lines bellow, change something
      in lib/KBreadcrumbs.vue and see the updates reflected
      on this page
    -->
    <!-- <KBreadcrumbs
      :items="[
        { text: 'Global Digital Library', link: { path: '#' } },
        { text: 'English', link: { path: '#' } },
        { text: 'Level 2 ', link: { path: '#' } },
      ]"
    /> -->

    <!-- Play around with your component here: -->

    <div class="wrapper">
      <KIcon
        icon="image"
        :style="{width: '40%', height: 'auto' }"
      />
    </div>
  </div>

</template>


<script>

  /*
    Playground is a Vue component too,
    so you can also use `data`, `methods`, etc.
    as usual if helpful
  */
  export default {
    name: 'Playground',
    data() {
      return {};
    },
    methods: {},
  };

</script>


<style lang="scss" scoped>

.wrapper {
  width: 50%;
  max-width: 300px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(102, 137, 102);
}

</style>