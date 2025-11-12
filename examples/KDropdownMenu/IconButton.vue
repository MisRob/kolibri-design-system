<template>

  <KIconButton
    tooltip="Dropdown options"
    icon="optionsHorizontal"
    appearance="flat-button"
    :primary="false"
  >
    <template #menu>
      <KDropdownMenu
        :hideOnClick="hideOnClick"
        :constrainToScrollParent="constrainToScrollParent"
        :options="options"
        @select="onOptionSelect"
      />
    </template>
  </KIconButton>

</template>


<script>

  export default {
    props: {
      openOnMount: {
        type: Boolean,
        default: true,
      },
      hideOnClick: {
        type: Boolean,
        default: false,
      },
      constrainToScrollParent: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
          { label: 'Option 3', value: 'option3' },
        ],
      };
    },
    mounted() {
      if (this.openOnMount) {
        this.$nextTick(() => {
          this.$el.click();
        });
      }
    },
    methods: {
      onOptionSelect(option) {
        console.log('Selected option:', option);
      },
    },
  };

</script>
