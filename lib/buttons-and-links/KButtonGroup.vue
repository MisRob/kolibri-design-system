<template>

  <div class="button-group">
    <!-- @slot Slot to wrap buttons and provide consistent spacing -->
    <slot></slot>
  </div>

</template>


<script>

  /**
   * Used to create a consistently spaced horizontal set of buttons and/or links.
   *
   * KButtonGroup works with KButton, KIconButton, KRouterLink and KExternalLink and any <a> or <button> tags.
   * in it's default slot.
   */

  export default {
    name: 'KButtonGroup',
  };

</script>


<style lang="scss" scoped>

  .button-group {
    display: inline-block;
  }

  /* KButton can produce <a> or <button> tags */
  .button-group > a,
  .button-group > button {
    margin-right: 8px;
    margin-left: 8px;
  }

</style>
