<template>

  <KTable
    :headers="headers"
    :rows="rows"
    caption="Test Table"
  >
    <!-- Header Cells -->
    <template #header="{ header }">
      <span v-if="addButtonsToColumnIDs.includes(header.columnId)">
        <KButton>{{ header.label }}</KButton>
      </span>
      <span v-else>
        {{ header.label }}
      </span>
    </template>

    <!-- Row Cells -->
    <template #cell="{ content, colIndex }">
      <span v-if="addButtonsToColumnIndices.includes(colIndex)">
        <KButton>{{ content }} </KButton>
      </span>
      <span v-else>{{ content }}</span>
    </template>
  </KTable>

</template>


<script>

  export default {
    props: {
      headers: {
        type: Array,
        required: true,
      },
      rows: {
        type: Array,
        required: true,
      },
      /*
       * Array of column IDs to which a button should be added
       */
      addButtonsToColumnIDs: {
        type: Array,
        default: () => [],
      },
    },
    computed: {
      /*
       * Array of column indices to which a button should be added
       */
      addButtonsToColumnIndices() {
        return this.headers
          .map((h, idx) => ({ ...h, idx }))
          .filter(h => this.addButtonsToColumnIDs.includes(h.columnId))
          .map(h => h.idx);
      },
    },
  };

</script>
