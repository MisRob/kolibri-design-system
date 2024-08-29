<template>

  <div :style="{ margin: '40px' }"> 
    <div id="container">
      <div id="logo">
        <img :src="require('../../assets/full-logo.png')">
      </div>
      <div id="screen-1">
        <h1 id="title">
          <span class="letter">T</span><span class="letter">h</span><span class="letter">a</span><span class="letter">n</span><span class="letter">k</span><span>&nbsp;</span><span class="letter">y</span><span class="letter">o</span><span class="letter">u</span><br>
          <span class="letter">f</span><span class="letter">o</span><span class="letter">r</span><span>&nbsp;</span><span class="letter">y</span><span class="letter">o</span><span class="letter">u</span><span class="letter">r</span><span>&nbsp;</span><span class="letter">c</span><span class="letter">o</span><span class="letter">n</span><span class="letter">t</span><span class="letter">r</span><span class="letter">i</span><span class="letter">b</span><span class="letter">u</span><span class="letter">t</span><span class="letter">i</span><span class="letter">o</span><span class="letter">n</span><span class="letter">s</span><br>
          <span class="letter subtitle">i</span><span class="letter subtitle">n</span><span>&nbsp;</span><span class="letter subtitle">A</span><span class="letter subtitle">u</span><span class="letter subtitle">g</span><span class="letter subtitle">u</span><span class="letter subtitle">s</span><span class="letter subtitle">t</span><span>&nbsp;</span><span class="letter subtitle">2</span><span class="letter subtitle">0</span><span class="letter subtitle">2</span><span class="letter subtitle">4</span>
        </h1>
        <div id="underline"></div>

        <div id="columns">
          <div class="column">
            <div class="name name-1">
              @BabyElias
            </div>
            <div class="name name-2">
              @benjaoming
            </div>
            <div class="name name-3">
              @GarvitSinghal47
            </div>
            <div class="name name-4">
              @KshitijThareja
            </div>
            <div class="name name-5">
              @lokesh-sagi125
            </div>
          </div>
          <div class="column">
            <div class="name name-6">
              @muditchoudhary
            </div>
            <div class="name name-7">
              @nathanaelg16
            </div>
            <div class="name name-8">
              @shivam-daksh
            </div>
            <div class="name name-9">
              @Spoorthy1423
            </div>
            <div class="name name-10">
              @thesujai
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>


<script>

  export default {
    name: 'Playground',
  };

</script>


<style scoped lang="scss">

  @import url('https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=Petrona:ital,wght@0,100..900;1,100..900&display=swap');

  #container {
    position: relative;
    max-width: 600px;
    margin: auto;
    margin-top: 100px;
    font-family: 'Figtree', sans-serif;
  }

  #title {
    line-height: 1.4;
    text-align: center;

    .subtitle {
      font-family: 'Petrona', serif;
      font-style: italic;
    }
  }

  #columns {
    display: flex;
    justify-content: space-evenly;
    margin-top: 40px;

    .column {
      margin: 0 40px;
    }

    .name {
      padding: 4px 0;
    }
  }

  #underline {
    position: absolute;
    top: 44px;
    left: 215px;
    width: 0;
    rotate: -1deg;
    height: 3px;
    background-color: #ffcb00;
  }

  #logo {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      max-width: 200px;
    }
  }

  // ******************************************************
  // ********************* Animations *********************
  // ******************************************************

  // set every month
  $count-title-month: 6;
  $count-names: 10;

  // no need to tweak
  $count-title-letter: 41 + $count-title-month;
  $delay-start-animation: 1s;
  $delay-show-names: calc(#{$delay-start-animation} + #{$count-title-letter} * 0.05s + 0.5s);
  $delay-show-underline: calc(#{$delay-show-names} + #{$count-names} * 0.3s + 0.5s);
  $delay-hide-screen-1: calc(#{$delay-show-underline} + 2.3s);
  $delay-show-logo: calc(#{$delay-hide-screen-1} + 1.5s);

  // 1. Show title

  @keyframes titleLetterAnimation {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  #title .letter {
    opacity: 0;
    animation: titleLetterAnimation ease-in-out 0.5s forwards;
  }

  #title .letter:nth-child(1) {
    animation-delay: $delay-start-animation;
  }

  @for $i from 2 through $count-title-letter {
    #title .letter:nth-child(#{$i}) {
      animation-delay: calc(#{$delay-start-animation} + (0.05s * #{$i}));
    }
  }

  // 2. Show names

  @keyframes namesAnimation {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  #columns .name {
    opacity: 0;
    animation: namesAnimation 0.5s ease-in-out forwards;
  }

  #columns .name-1 {
    animation-delay: $delay-show-names;
  }

  @for $i from 2 through $count-names {
    #columns .name-#{$i} {
      animation-delay: calc(#{$delay-show-names} + (0.3s * #{$i}));
    }
  }

  // 3. Show underline

  @keyframes underlineAnimation {
    0% {
      width: 0;
    }
    100% {
      width: 166px;
    }
  }

  #underline {
    animation: underlineAnimation 1s ease-in-out forwards;
    animation-delay: $delay-show-underline;
  }

  // 4. Hide screen

  @keyframes screen1Animation {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  #screen-1 {
    animation: screen1Animation 0.8s ease-in-out forwards;
    animation-delay: $delay-hide-screen-1;
  }

  //  5. Show and hide logo

  @keyframes logoAnimation {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    70% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  #logo {
    opacity: 0;
    animation: logoAnimation 3.5s ease-in-out forwards;
    animation-delay: $delay-show-logo;
  }

</style>