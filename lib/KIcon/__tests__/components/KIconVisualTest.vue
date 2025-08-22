<template>

  <VisualTestLayout>
    <VisualTestExample
      title="Basic"
      loadExample="KIcon/Basic.vue"
    />

    <VisualTestExample
      title="Color"
      loadExample="KIcon/Color.vue"
    />

    <VisualTestExample title="Ignores color prop">
      <KIcon
        icon="allActivities"
        color="green"
      />
    </VisualTestExample>

    <VisualTestExample title="Broken image for non-existent icon">
      <KIcon icon="Non icon" />
    </VisualTestExample>

    <VisualTestExample
      title="Size"
      loadExample="KIcon/Size.vue"
    />

    <VisualTestExample
      title="Responsive"
      loadExample="KIcon/Responsive.vue"
    />
  </VisualTestLayout>

</template>


<script>

  export default {
    name: 'KIconVisualTest',
  };

</script>
