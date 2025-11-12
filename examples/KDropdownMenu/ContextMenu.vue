<template>

  <div>
    <p>
      Right click on this paragraph to see a context menu.
      <KDropdownMenu
        isContextMenu
        :options="options"
        @select="onOptionSelect"
      />
    </p>
    <p>
      Just one context menu can be open at a time. If you right-click on this paragraph, any other
      context menu will close.
      <KDropdownMenu
        isContextMenu
        :options="['Another option']"
        @select="onOptionSelect"
      />
    </p>
  </div>

</template>


<script>

  export default {
    data() {
      return {
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ],
      };
    },
    methods: {
      onOptionSelect(option) {
        console.log('Selected option:', option);
      },
    },
  };

</script>
