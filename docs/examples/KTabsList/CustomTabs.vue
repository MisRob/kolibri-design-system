<template>

    <KTabsList
      v-model="activeTabId"
      tabsId="tabsSlot"
      ariaLabel="Coach reports"
      :tabs="tabs"
    >
      <template #tab="{ tab, isActive }">
        <KLabeledIcon
          :icon="icons[tab.id]"
          :label="tab.label"
          :color="isActive ? $themeTokens.primary : $themeTokens.annotation"
        />
      </template>
    </KTabsList>

</template>


<script>
import { sharedExampleData } from '../../pages/ktabslist.vue';

export default {
  data() {
    // Clone the shared data to avoid shared state
    return {
      tabs: [...sharedExampleData.tabs], // Clone the tabs array
      activeTabId: sharedExampleData.activeTabId, // Copy primitive value
      icons: { ...sharedExampleData.icons }, // Clone the icons object
    };
  },
};
</script>
