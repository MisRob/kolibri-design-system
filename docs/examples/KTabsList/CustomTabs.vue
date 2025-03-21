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
export default {
data() {
  return {
    activeTabId: 'tabLessons',
    tabs: [
      { id: 'tabLessons', label: 'Lessons' },
      { id: 'tabLearners', label: 'Learners' },
      { id: 'tabGroups', label: 'Groups' },
    ],
    icons: {
      tabLessons: 'lesson',
      tabLearners: 'person',
      tabGroups: 'people',
    },
  };
},
};
</script>
