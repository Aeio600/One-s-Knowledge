<template>
  <div class="bgc _full">
    <div>
      <h1 class="page-title flex-row-center-middle _pointer" @click="handleClick">
        <img :src="`img/login_bg_white.png`" style="transform:scale(1.2);" alt="智慧档案" />
      </h1>
      <div class="title-footer">
        <img class="image _full" :src="`img/dashboard/header-bg.png`" alt="" />
      </div>
    </div>

    <!-- <Bg9
      style="top: 10px"
      :bgList="bgList"
      :size="[766, 798, 81, 912]"
    ></Bg9> -->

    <!-- <Bg9 style="top: 10px" :bgList="bgList" :size="[766, 798, 81, 912]"></Bg9> -->
  </div>
</template>

<script lang="ts" setup>
type Props = {
  bgList?: { url: string }[];
};

const props = withDefaults(defineProps<Props>(), {
  bgList: () => {
    return [
      { url: "images/dashboard/home-page-bg-border-9/home-bg-border-9_01.png" },
      { url: "images/dashboard/home-page-bg-border-9/home-bg-border-9_02.png" },
      { url: "images/dashboard/home-page-bg-border-9/home-bg-border-9_03.png" },
      { url: "images/dashboard/home-page-bg-border-9/home-bg-border-9_04.png" },
      { url: "images/dashboard/home-page-bg-border-9/home-bg-border-9_05.png" },
      { url: "images/dashboard/home-page-bg-border-9/home-bg-border-9_06.png" },
      { url: "images/dashboard/home-page-bg-border-9/home-bg-border-9_07.png" },
      { url: "images/dashboard/home-page-bg-border-9/home-bg-border-9_08.png" },
      { url: "images/dashboard/home-page-bg-border-9/home-bg-border-9_09.png" },
    ];
  },
});

const handleClick = () => {
  window.location.href = import.meta.env.VITE_BASE_SMART_URL
}
</script>

<style lang="scss" scoped>
.bgc {
  position: absolute;
  top: 0;
  left: 0;
  // background-image: url("img/dashboard/background.png");
  background-size: 100% 100%;
  z-index: 1;
  height: 90px;

  .page-title {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    margin: auto;
    text-align: center;
    height: 66px;
    font-size: 32px;
    letter-spacing: 5px;
    z-index: 1;

    // background-image: linear-gradient(to bottom, #3aa1f6, #062858);
    // -webkit-background-clip: text;
    // color: transparent;
    img {
      height: 40px;
    }
  }

  .title-footer {
    pointer-events: none;
    text-align: center;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
  }

  .image {
    width: 100%;
    height: 100%;
  }

  // .logo {
  //   background-image: url("~@/assets/img//dashboard/logo-fill.png");
  //   background-size: contain;
  //   width: 190px;
  //   height: 31px;
  //   position: absolute;
  //   top: 10px;
  //   left: 20px;
  // }

  // .botton-light {
  //   width: 276px;
  //   height: 19px;
  //   background-image: url("~@/assets/img//dashboard/home-page-botton-light.png");
  //   background-repeat: no-repeat;
  //   position: absolute;
  //   bottom: 12px;
  //   left: 0;
  //   right: 0;
  //   margin: auto;
  // }
}
</style>
