<template>

  <KToolbar
    title="Page Title"
    textColor="black"
    :style="{ backgroundColor: $themeTokens.appBar }"
  >
    <template #icon>
      <KIconButton
        icon="close"
        :color="$themeTokens.text"
        :ariaLabel="'Close'"
      />
    </template>
  </KToolbar>

</template>


<script>

  import KToolbar from '../../../lib/KToolbar.vue';
  import KIconButton from '../../../lib/KIcon/index.vue';

  export default {
    components: {
      KToolbar,
      KIconButton,
    },
  };

</script>
