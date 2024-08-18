<template>

  <div :style="{ margin: '40px' }"> 

    <div class="container">
      <img id="logo" :src="require('../../assets/logo-with-text.png')">
      <svg id="from" height="200" width="350" xmlns="http://www.w3.org/2000/svg">
        <path id="lineAC" d="M 30 180 q 150 -250 300 0" stroke="none" stroke-width="2" fill="none" />
        <text style="fill:black;font-size:12px;">
          <textPath href="#lineAC" startOffset="180">from</textPath>
        </text>
      </svg> 

      <h1 class="title">
        <span class="letter">T</span><span class="letter">h</span><span class="letter">a</span><span class="letter">n</span><span class="letter">k</span><span>&nbsp;</span><span class="letter">y</span><span class="letter">o</span><span class="letter">u</span><br>
        <span class="letter">f</span><span class="letter">o</span><span class="letter">r</span><span>&nbsp;</span><span class="letter">y</span><span class="letter">o</span><span class="letter">u</span><span class="letter">r</span><span>&nbsp;</span><span class="letter">c</span><span class="letter">o</span><span class="letter">n</span><span class="letter">t</span><span class="letter">r</span><span class="letter">i</span><span class="letter">b</span><span class="letter">u</span><span class="letter">t</span><span class="letter">i</span><span class="letter">o</span><span class="letter">n</span><span class="letter">s</span><br>
        <span class="letter subtitle">i</span><span class="letter subtitle">n</span><span>&nbsp;</span><span class="letter subtitle">A</span><span class="letter subtitle">u</span><span class="letter subtitle">g</span><span class="letter subtitle">u</span><span class="letter subtitle">s</span><span class="letter subtitle">t</span><span>&nbsp;</span><span class="letter subtitle">2</span><span class="letter subtitle">0</span><span class="letter subtitle">2</span><span class="letter subtitle">4</span>
      </h1>
      <div id="underline"></div>

      <div class="columns">
        <div class="column">
          <div class="name name-1">
            @BabyElias
          </div>
          <div class="name name-2">
            @benjaoming
          </div>
          <div class="name name-3">
            @KshitijThareja
          </div>
        </div>
        <div class="column">
          <div class="name name-4">
            @nathanaelg16
          </div>
          <div class="name name-5">
            @shivam-daksh
          </div>
          <div class="name name-6">
            @thesujai
          </div>
        </div>
      </div>
    </div>
  </div>

</template>


<script>

  /*
    Playground is a Vue component too,
    so you can also use `data`, `methods`, etc.
    as usual if helpful
  */
  export default {
    name: 'Playground',
    data() {
      return {};
    },
    mounted() {},
    methods: {},
  };

</script>


<style scoped lang="scss">

  @import url('https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=Petrona:ital,wght@0,100..900;1,100..900&display=swap');

  .container {
    position: relative;
    max-width: 600px;
    margin: auto;
    margin-top: 100px;
    font-family: 'Figtree', sans-serif;
    animation: fadeOutContainer 0.5s ease-in-out forwards;
    animation-delay: 10s;
  }

  .title {
    line-height: 1.4;
    text-align: center;
  }

  .letter {
    opacity: 0;
    animation: showTitleLetter ease-in-out 0.5s forwards;
  }

  .subtitle {
    font-family: 'Petrona', serif;
    font-style: italic;
  }

  .columns {
    display: flex;
    justify-content: space-evenly;
    margin-top: 40px;
  }

  .column {
    margin: 0 40px;
  }

  .name {
    padding: 4px 0;
    opacity: 0;
    animation: showName 0.5s ease-in-out forwards;
  }

  #underline {
    position: absolute;
    top: 44px;
    left: 210px;
    width: 0;
    rotate: -1deg;
    height: 3px;
    background-color: #ffcb00;
    animation: showUnderline 1s ease-in-out forwards;
    animation-delay: 5.7s;
  }

  #from {
    position: absolute;
    top: -94px;
    right: 20px;
    font-family: 'Petrona', serif;
    rotate: -38deg;
    opacity: 0;
    animation: showFrom 0.8s ease-in-out forwards;
    animation-delay: 6.7s;
  }

  #logo {
    position: absolute;
    top: -36px;
    right: 162px;
    max-width: 80px;
    opacity: 0;
    rotate: 5deg;
    animation: showLogo 0.8s ease-in-out forwards;
    animation-delay: 7.2s;
  }

  /********************* title animation *********************/

  @keyframes showTitleLetter {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @mixin title-letter-animation($count, $delay-step: 0.05s) {
    @for $i from 2 through $count {
      .letter:nth-child(#{$i}) {
        animation-delay: calc(1s + (#{$delay-step} * #{$i}));
      }
    }
  }
  .letter:nth-child(1) {
    animation-delay: 1s;
  }
  @include title-letter-animation(47);

  /********************* names animation *********************/

  @keyframes showName {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @mixin name-animation($count, $delay-step: 0.3s) {
    @for $i from 2 through $count {
      .name-#{$i} {
        animation-delay: calc(3.8s + (#{$delay-step} * #{$i}));
      }
    }
  }
  .name-1 {
    animation-delay: 3.8s;
  }
  @include name-animation(6);

  /********************* underline animation *********************/

  @keyframes showUnderline {
    0% {
      width: 0;
    }
    100% {
      width: 170px;
    }
  }

  /********************* from animation *********************/

  @keyframes showFrom {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  /********************* logo animation *********************/

  @keyframes showLogo {
    0% {
      opacity: 0;
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      opacity: 0.8;
      transform: scale(1);
    }
  }

  /********************* container animation *********************/

  @keyframes fadeOutContainer {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

</style>