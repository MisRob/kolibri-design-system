<template>
    <KTabsList
      v-model="activeTabId"
      tabsId="tabsProps"
      ariaLabel="Coach reports"
      :tabs="tabs"
      :color="$themeTokens.textInverted"
      :colorActive="$themeTokens.textInverted"
      :backgroundColor="$themeTokens.primaryDark"
      :hoverBackgroundColor="$themeTokens.primaryDark"
    />

</template>


<script>
import { sharedExampleData } from '../../pages/ktabslist.vue';

export default {
  data() {
    return {
      tabs: [...sharedExampleData.tabs], 
      activeTabId: sharedExampleData.activeTabId, 
    };
  },
};
</script>