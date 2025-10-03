<template>

  <KButton
    text="Options"
    hasDropdown
  >
    <template #menu>
      <KDropdownMenu
        :hideOnClick="false"
        :constrainToScrollParent="false"
        :options="['Single Option']"
      />
    </template>
  </KButton>

</template>


<script>

  export default {
    name: 'SingleItem',
    mounted() {
      this.$nextTick(() => {
        this.$el.click();
      });
    },
  };

</script>
