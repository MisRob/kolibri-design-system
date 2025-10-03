<template>

  <KButton
    text="Options"
    hasDropdown
  >
    <template #menu>
      <KDropdownMenu
        :hideOnClick="false"
        :constrainToScrollParent="false"
        :options="['Option 1', 'Option 2', 'Option 3']"
      />
    </template>
  </KButton>

</template>


<script>

  export default {
    name: 'MultipleItems',
    mounted() {
      this.$nextTick(() => {
        this.$el.click();
      });
    },
  };

</script>
