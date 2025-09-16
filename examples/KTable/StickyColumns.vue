<template>

  <KTable
    :headers="headersWithCustomWidths"
    :rows="customRows"
    :stickyColumns="stickyColumns"
    caption="Table showing sticky columns"
    sortable
  />

</template>


<script>

  export default {
    data() {
      return {
        headersWithCustomWidths: [
          { label: 'Name', dataType: 'string', minWidth: '120px', columnId: 'name' },
          { label: 'Age', dataType: 'number', minWidth: '100px', columnId: 'age' },
          { label: 'City', dataType: 'string', minWidth: '200px', columnId: 'city' },
          {
            label: 'Joined',
            dataType: 'date',
            minWidth: '150px',
            columnId: 'joined',
          },
          {
            label: 'Favorite Color',
            dataType: 'string',
            minWidth: '150px',
            columnId: 'favoriteColor',
          },
          {
            label: 'Favorite Food',
            dataType: 'string',
            minWidth: '150px',
            columnId: 'favoriteFood',
          },
          {
            label: 'Options',
            dataType: 'string',
            minWidth: '200px',
            columnId: 'options',
          },
        ],
        customRows: [
          ['John Doe', 28, 'New York', '2022-01-15T00:00:00Z', 'Blue', 'Pizza', 'Edit/Delete'],
          [
            'Jane Smith',
            34,
            'Los Angeles',
            '2021-12-22T00:00:00Z',
            'Green',
            'Sushi',
            'Edit/Delete',
          ],
          ['Samuel Green', 22, 'Chicago', '2023-03-10T00:00:00Z', 'Red', 'Tacos', 'Edit/Delete'],
          [
            'Alice Johnson',
            30,
            'Houston',
            '2020-07-18T00:00:00Z',
            'Purple',
            'Burgers',
            'Edit/Delete',
          ],
        ],
        stickyColumns: ['firstTwo', 'last'],
      };
    },
  };

</script>
