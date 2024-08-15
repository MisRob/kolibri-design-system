<template>

  <div :style="{ margin: '40px' }"> 
    <div class="card">
      <div class="thumbnail"></div>
      <div class="content">
        <h2>Card Title</h2>
        <p>This is some dynamic content that can grow or shrink based on its size.</p>
      </div>
    </div>

    <h2>Default '1-2' grid, horizontal cards, large thumbnail on the left</h2>
    <KButton class="loading-button" @click="load1">
      Load!
    </KButton>
    <div :style="{ 'min-height': '1200px', 'max-width': '1400px' }">
      <KCardGrid
        kind="1-2"
        :isLoading="isLoading1"
        skeletonLayout="horizontal"
        skeletonThumbnailDisplay="large"
        skeletonThumbnailAlign="left"
        skeletonHeight="240px"
      >
        <HorizontalCardWithThumbnail
          v-for="i in 8"
          :key="i"
          thumbnailAlign="left"
        />
      </KCardGrid>
    </div>

    <h2>Default '1-2' grid, horizontal cards, large thumbnail on the right</h2>
    <KButton class="loading-button" @click="load2">
      Load!
    </KButton>
    <div :style="{ 'min-height': '1200px', 'max-width': '1400px' }">
      <KCardGrid
        kind="1-2"
        :isLoading="isLoading2"
        :skeletonCount="2"
        skeletonLayout="horizontal"
        skeletonThumbnailDisplay="large"
        skeletonThumbnailAlign="right"
        skeletonHeight="240px"
      >
        <HorizontalCardWithThumbnail
          v-for="i in 8"
          :key="i"
          thumbnailAlign="right"
        />
      </KCardGrid>
    </div>

    <h2>Default '1-2-3' grid, vertical cards</h2>
    <KButton class="loading-button" @click="load3">
      Load!
    </KButton>
    <div :style="{ 'min-height': '1200px', 'max-width': '1400px' }">
      <KCardGrid
        kind="1-2-3"
        :isLoading="isLoading3"
        skeletonLayout="vertical"
        skeletonThumbnailDisplay="small"
        skeletonHeight="530px"
      >
        <VerticalCardWithThumbnail
          v-for="i in 8"
          :key="i"
          thumbnailDisplay="small"
        />
      </KCardGrid>
    </div>


    <h2>Grid with overriden defaults via shortcut props or config</h2>
    <KButton class="loading-button" @click="load4">
      Load!
    </KButton>
    <div :style="{ 'min-height': '1200px', 'max-width': '1400px' }">
      <KCardGrid
        kind="1-2"
        rowGap="50px"
        :config="config1"
        :isLoading="isLoading4"
        :skeletonCount="4"
        skeletonLayout="vertical"
        skeletonThumbnailDisplay="large"
        skeletonHeight="425px"
      >
        <VerticalCardWithThumbnail
          v-for="i in 8"
          :key="i"
          thumbnailDisplay="large"
        />
      </KCardGrid>
    </div>

    <h2>'1-2-3' grid, no thumbnail</h2>
    <KButton class="loading-button" @click="load5">
      Load!
    </KButton>
    <div :style="{ 'min-height': '1200px', 'max-width': '1400px' }">
      <KCardGrid
        kind="1-2-3"
        :isLoading="isLoading5"
        skeletonThumbnailDisplay="none"
        skeletonHeight="200px"
      >
        <VerticalCardWithThumbnail
          v-for="i in 8"
          :key="i"
          thumbnailDisplay="none"
        />
      </KCardGrid>
    </div>
  </div>

</template>


<script>

  import VerticalCardWithThumbnail from './VerticalCardWithThumbnail';
  import HorizontalCardWithThumbnail from './HorizontalCardWithThumbnail';

  /*
    Playground is a Vue component too,
    so you can also use `data`, `methods`, etc.
    as usual if helpful
  */
  export default {
    name: 'Playground',
    components: {
      VerticalCardWithThumbnail,
      HorizontalCardWithThumbnail,
    },
    data() {
      return {
        isLoading1: true,
        isLoading2: true,
        isLoading3: true,
        isLoading4: true,
        isLoading5: true,
        config1: {
          'level-0': {
            rowGap: '100px',
            columns: 2,
          },
          'level-5': {
            columns: 4,
          },
          'level-6': {
            columns: 5,
          },
          'level-7': {
            columns: 5,
          },
        },
      };
    },
    mounted() {
      setTimeout(() => {
        this.isLoading1 = false;
        this.isLoading2 = false;
        this.isLoading3 = false;
        this.isLoading4 = false;
        this.isLoading5 = false;
      }, 1000);
    },
    methods: {
      load1() {
        this.isLoading1 = true;
        setTimeout(() => {
          this.isLoading1 = false;
        }, 1000);
      },
      load2() {
        this.isLoading2 = true;
        setTimeout(() => {
          this.isLoading2 = false;
        }, 1000);
      },
      load3() {
        this.isLoading3 = true;
        setTimeout(() => {
          this.isLoading3 = false;
        }, 1000);
      },
      load4() {
        this.isLoading4 = true;
        setTimeout(() => {
          this.isLoading4 = false;
        }, 1000);
      },
      load5() {
        this.isLoading5 = true;
        setTimeout(() => {
          this.isLoading5 = false;
        }, 1000);
      },
    },
  };

</script>


<style scoped lang="scss">

  .loading-button {
    margin-bottom: 20px;
  }

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 300px;
    background-color: white;
    border: 1px solid black;
  }

  .thumbnail {
    position: absolute;
    top: 0;
    width: 100%;
    height: 40%;
    background-color: lightcoral;
  }

  .content {
    padding: 10px;
    margin-top: 40%;
    background-color: lightblue;
  }

</style>