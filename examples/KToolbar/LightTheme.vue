<template>

  <KToolbar
    title="Toolbar title"
    :backgroundColor="$themeTokens.appBar"
  >
    <template #icon>
      <KIconButton
        icon="close"
        :ariaLabel="'Close'"
      />
    </template>
  </KToolbar>

</template>
