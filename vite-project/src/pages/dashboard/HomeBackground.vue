<template>
  <div class="bgc _full">
    <div class="page-title">
      <img :src="`img/login_bg_white.png`" style="transform:scale(1.2);" alt="智慧档案" />
    </div>
    <div class="title-footer">
      <img class="image _full" :src="`img/dashboard/header-bg.png`" alt="" />
    </div>
  </div>
</template>

<script lang="ts" setup>
// type Props = {
//   bgList?: {url: string}[];
// }

// const props = withDefaults(defineProps<Props>(), {
//   bgList: () => {
//     return [
//       { url: "img/dashboard/home-page-bg-border-9/home-bg-border-9_01.png" }
//     ]
//   }
// })
</script>

<style lang="scss" scoped>
.bgc {
  position: absolute;
  top: 0;
  left: 0;
  height: 90px;
  background-size: 100% 100%;
  z-index: 1;
  background-color: aquamarine;

  .page-title {
    position: absolute;
    top: 13px;
    left: 0;
    right: 0;
    margin: auto;
    z-index: 1;

    img {
      height: 40px;
    }

  }
  .title-footer {
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
  }
}
</style>