<template>

  <KToolbar
    title="Toolbar title"
    :textColor="$themeTokens.textInverted"
    :backgroundColor="$themeTokens.appBarDark"
  >
    <template #icon>
      <KIconButton
        icon="back"
        :color="$themeTokens.textInverted"
        :ariaLabel="'Go back'"
      />
    </template>
  </KToolbar>

</template>
