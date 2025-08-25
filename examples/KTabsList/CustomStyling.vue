<template>

  <KTabsList
    v-model="activeTabId"
    tabsId="tabsProps"
    ariaLabel="Coach reports"
    :tabs="tabs"
    :color="$themeTokens.primary"
    :colorActive="$themeTokens.primary"
    :backgroundColor="$themeTokens.secondary"
    :hoverBackgroundColor="$themeTokens.secondaryDark"
  />

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
      };
    },
  };

</script>
