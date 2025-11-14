<template>
  <KTextbox label="This label is overridden by the slot">
    <template #label>
      <span style="font-style: italic">First name</span>
    </template>
  </KTextbox>
</template>

<script>
  export default {
    name: 'WithLabelSlotAndProp',
  };
</script>
