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
    <KTable
      :headers="headers"
      :rows="rows"
      caption="Non Sortable Table"
    />
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
      return {
        headers: [
          { label: 'Name', dataType: 'string', columnId: 'name' },
          { label: 'Age', dataType: 'number', columnId: 'age' },
          { label: 'City', dataType: 'string', columnId: 'city' },
        ],
        rows: [
          ['John Doe', 28, 'New York'],
          ['Jane Smith', 34, 'Los Angeles'],
          ['Samuel Green', 22, 'Chicago'],
          ['Alice Johnson', 30, 'Houston'],
          ['Michael Brown', 45, 'Phoenix'],
          ['Emily Davis', 27, 'Philadelphia'],
        ],
      };
    },
    methods: {},
  };

</script>
