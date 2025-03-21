<template>
    <KTabsList
      v-model="activeTabId"
      tabsId="tabsIntro"
      ariaLabel="Coach reports"
      :tabs="tabs"
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
