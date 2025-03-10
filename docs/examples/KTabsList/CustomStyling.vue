<template>
  <div
    :style="{
      backgroundColor: $themePalette.grey.v_700,
      padding: '10px 20px',
      color: $themeTokens.textInverted,
      display:'inline-block'
    }"
  >
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
  </div>
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
