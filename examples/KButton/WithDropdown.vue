<template>

  <KButton
    primary
    text="Dropdown Button"
  >
    <template #menu>
      <KDropdownMenu
        :hideOnClick="false"
        :constrainToScrollParent="false"
        :options="[{ label: 'Option 1' }, { label: 'Option 2' }]"
      />
    </template>
  </KButton>

</template>


<script>

  export default {
    name: 'WithDropdown',
    mounted() {
      this.$nextTick(() => {
        this.$el.click();
      });
    },
  };

</script>
