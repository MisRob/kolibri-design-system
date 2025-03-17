<template>

    <KTabsList
      v-model="activeTabId"
      tabsId="tabsAppearanceOverrides"
      ariaLabel="Coach reports"
      :tabs="tabs"
      :appearanceOverrides="{
        ':hover': {
          color: $themeTokens.primary,
        },
        textTransform: 'none',
        margin: '0 32px',
      }"
      :appearanceOverridesActive="{
        borderBottomWidth: '6px',
      }"
    />

</template>


<script>
import { sharedExampleData } from '../../pages/ktabslist.vue';

export default {
  data() {
    return sharedExampleData; // Use shared data
  },
};
</script>
