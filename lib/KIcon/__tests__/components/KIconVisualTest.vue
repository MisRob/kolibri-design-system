<template>

  <div>
    <p>Basic:</p>
    <Basic />

    <p>Size:</p>
    <Size />

    <p>Color:</p>
    <Color />

    <p>Responsive:</p>
    <Responsive />

    <p>Ignores color prop:</p>
    <KIcon
      icon="allActivities"
      color="green"
    />

    <p>Broken image for non-existent icon:</p>
    <KIcon icon="Non icon" />
  </div>

</template>


<script>

  import Basic from '../../../../docs/examples/KIcon/Basic';
  import Size from '../../../../docs/examples/KIcon/Size';
  import Color from '../../../../docs/examples/KIcon/Color';
  import Responsive from '../../../../docs/examples/KIcon/Responsive';

  export default {
    name: 'KIconVisualTest',
    components: {
      Basic,
      Size,
      Color,
      Responsive,
    },
  };

</script>
