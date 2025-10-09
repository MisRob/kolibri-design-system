<template>

  <KBreadcrumbs
    :items="[
      { text: 'Home', link: { path: '/' } },
      { text: 'Library', link: null },
      { text: 'Category', link: { path: '/category' } },
      { text: 'Subcategory', link: { path: '/subcategory' } },
      { text: 'Files', link: null },
    ]"
  />

</template>
