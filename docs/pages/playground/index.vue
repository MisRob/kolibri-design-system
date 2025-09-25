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
     <KCheckbox
      v-for="group in groups"
      :label="group.name"
      :key="group.id"
      :checked="groupIsSelected(group)"
      @change="toggleGroup($event, group)"
    />

    <!-- 
      (1) Boolean
      // If checked, selectedBooleanValue will be true, otherwise false
      <KCheckbox
        v-model="selectedBooleanValue"
        label="Label"
      />

      (2) Array
      // If checked, 'value' will be added to selectedGroupIds, otherwise removed
      <KCheckbox
        v-for="group in groups"
        v-model="selectedGroupIds"
        :label="group.name"
        :key="group.id"
        :value="group.id"
      />

      (3) Number
      // If checked, selectedNumberValue will be set to 'value', otherwise null
      <KCheckbox
        v-model="selectedNumberValue"
        :label="Number 1"
        :value="1"
      />

      (4) String
      // If checked, selectedStringValue will be set to 'value', otherwise null
      <KCheckbox
        v-model="selectedStringValue"
        :label="String 1"
        :value="'String'"
      />

      (5) Object
      // If checked, selectedObjectValue will be set to 'value', otherwise null
      <KCheckbox
        v-model="selectedObjectValue"
        :label="Object 1"
        :value="{ id: 1, name: 'Object 1' }"
      />

      [Array, Boolean, Number, String, Object],
      * If used as an array, "value" prop is added/removed from it based on the checkbox state.
       * If used as a boolean, it is set to true when checked and false when unchecked.
       * If used as any other type, it is set to "value" prop when checked and null when unchecked.
    -->
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
        groups: [
          {
            "id": "group-1",
            "name": "First group",
          },
          {
            "id": "group-2",
            "name": "Second group",
          },
          {
            "id": "group-3",
            "name": "Third group",
          }
        ],
        selectedGroupIds: [],
      };
    },
    methods: {
      groupIsSelected({ id }) {
        return this.selectedGroupIds.includes(id);
      },
      toggleGroup(isChecked, { id }) {
        if (isChecked) {
          this.selectedGroupIds = [...this.selectedGroupIds, id];
        } else {
          this.selectedGroupIds = this.selectedGroupIds.filter(
            groupId => groupId !== id,
          );
        }
      },
    },
  };

</script>
