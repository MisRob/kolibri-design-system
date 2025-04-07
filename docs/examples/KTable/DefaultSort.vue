<template>

  <div>
    <h4>Sortable table with rows sorted by 'Age' column</h4>
    <KTable
      :headers="headers"
      :rows="rows"
      caption="Sortable table with rows sorted by 'Age' column"
      sortable
      :defaultSort="{ columnId: 'age', direction: 'asc' }"
    />

    <h4>Unsortable table with rows sorted by 'Age' column</h4>
    <KTable
      :headers="headers"
      :rows="rows"
      caption="Unsortable table with rows sorted by 'Age'  by 'Age' column"
      :defaultSort="{ columnId: 'age', direction: 'asc' }"
    />
  </div>

</template>


<script>

  export default {
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
  };

</script>
