<template>
  <KTextbox>
    <template #label>
      <span id="label-slot-example" style="font-weight: bold">First name</span>
    </template>
  </KTextbox>
</template>

<script>
  export default {
    name: 'WithLabelSlot',
  };
</script>
