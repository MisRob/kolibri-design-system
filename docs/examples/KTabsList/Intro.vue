<template>
    <KTabsList
      v-model="activeTabId"
      tabsId="tabsIntro"
      ariaLabel="Coach reports"
      :tabs="tabs"
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
