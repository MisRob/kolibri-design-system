<template>

  <KButton
    text="Options"
    hasDropdown
  >
    <template #menu>
      <KDropdownMenu
        :options="['Option 1', 'Option 2']"
        :hideOnClick="false"
        :constrainToScrollParent="false"
      >
        <template #header>
          <div style="padding: 8px 16px; margin: 0; font-size: 14px; color: gray">Menu Header</div>
        </template>
      </KDropdownMenu>
    </template>
  </KButton>

</template>


<script>

  export default {
    name: 'WithHeader',
    mounted() {
      this.$nextTick(() => {
        this.$el.click();
      });
    },
  };

</script>
