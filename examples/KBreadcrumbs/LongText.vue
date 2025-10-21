<template>

  <KBreadcrumbs
    :items="[
      { text: 'Home', link: { path: '/' } },
      { text: 'Data', link: { path: '/' } },
      {
        text: 'Very long breadcrumb that should truncate properly when displayed in the component',
        link: { path: '/long' },
      },
    ]"
  />

</template>
