<template>

  <KButton
    text="Options"
    hasDropdown
  >
    <template #menu>
      <KDropdownMenu
        hasIcons
        :constrainToScrollParent="false"
        :hideOnClick="false"
        :options="[
          { label: 'Add', icon: 'add' },
          { label: 'Delete', icon: 'delete' },
        ]"
      />
    </template>
  </KButton>

</template>


<script>

  export default {
    name: 'WithIcons',
    mounted() {
      this.$nextTick(() => {
        this.$el.click();
      });
    },
  };

</script>
