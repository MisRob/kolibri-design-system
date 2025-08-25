<template>

  <KImg
    src=""
    isDecorative
    aspectRatio="16:9"
    class="img"
  >
    <template #placeholder>
      <span class="placeholder">
        <KIcon
          class="icon"
          icon="readSolid"
        />
      </span>
    </template>
  </KImg>

</template>


<style lang="scss" scoped>

  .img {
    max-width: 300px;
  }

  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .icon {
    width: 50%;
    min-width: 24px;
    height: 50%;
  }

</style>
