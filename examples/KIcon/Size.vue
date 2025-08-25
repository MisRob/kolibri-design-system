<template>

  <div class="wrapper">
    <KIcon
      icon="helpOutline"
      class="icon-1"
    />

    <KIcon
      icon="helpOutline"
      class="icon-2"
    />

    <KIcon
      icon="helpOutline"
      class="icon-3"
    />
  </div>

</template>


<style lang="scss" scoped>

  .wrapper {
    display: inline-flex;
    gap: 24px;
    align-items: center;
    justify-content: space-between;
    width: 400px;
    height: 150px;
  }

  .icon-1 {
    font-size: 40px;
  }

  .icon-2 {
    width: 40px;
    height: 40px;
  }

  .icon-3 {
    width: auto;
    height: 80%;
  }

</style>
