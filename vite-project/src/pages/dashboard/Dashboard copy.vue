<template>
  <div class="_full home">
    <!-- <HomeBackground></HomeBackground> -->
    <!-- <div class="page-background _full"></div> -->
    <DashboardBg style="pointer-events: all"></DashboardBg>
    <!-- 监控预览 -->
    <!-- <div v-if="buildingStore.store.cameraVideoKeyYulan" class="_full flex-row-center-middle"
      style="z-index:2;position: absolute;left:0;top:0;background-color: rgb(0, 0, 0,0.5);">
      <cameraVideo style="height: 95%;width:90%"></cameraVideo>
    </div> -->
    <!-- 监控回访 -->
    <!-- <div v-if="buildingStore.store.cameraVideoKeyHuifang" class="_full flex-row-center-middle"
      style="z-index:2;position: absolute;left:0;top:0;background-color: rgb(0, 0, 0,0.5);">
      <hkH5PlayerHuifang :videoKey="buildingStore.store.cameraVideoKeyHuifang" style="height: 90%;width:95%">
      </hkH5PlayerHuifang>
    </div> -->
    <transition name="leave-left">
      <div class="column-between _position" style="left: 2%;top: 12%;bottom: 10%" v-if="buildingStore.store.showAll">
        <LeftTop class=""> </LeftTop>
        <LeftBottom class=""> </LeftBottom>
      </div>
    </transition>

    <transition name="leave-right">
      <div class="column-between _position" style="right: 2%;top: 12%;bottom: 10%" v-if="buildingStore.store.showAll">
        <RightTop class=""> </RightTop>
        <RightBottom class=""> </RightBottom>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
// import HomeBackground from "./HomeBackground.vue";

// import DashboardBg from "@/components/work/building/Building.vue";
// import LeftTop from "@/pages/dashboard/components/LeftTop.vue";
// import LeftBottom from '@/pages/dashboard/components/LeftBottom.vue'
// import RightTop from '@/pages/dashboard/components/RightTop.vue'
// import RightBottom from '@/pages/dashboard/components/RightBottom.vue'
// import { buildingStore } from "@/components/work/building/buildingStore";
// import cameraVideo from '@/components/work/building/CSS3DContainer/cameraVideo/cameraVideo.vue'
// import hkH5PlayerHuifang from '@/components/work/video/hkH5PlayerHuifang.vue'


</script>

<style lang="scss" scoped>
.page-background {
  position: absolute;
  top: 0;
  left: 0;
  background-image: url("img/dashboard/background.png");
  background-size: 100% 100%;
  height: 100%;
  width: 100%;
  z-index: -10;
}

.column-between {
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: 45% 45%;
  gap: 10%;
}

.block-bg {
  // background-image: url(img/dashboard/block2.png);
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 25px;
  box-sizing: border-box;
}

.home {
  position: relative;
  overflow: hidden;
  color: var(--var-color-text-primary);
}

.left-container {
  position: absolute;
  left: 10px;
  top: 80px;
  bottom: 50px;
  height: auto;
  width: 510px;
  pointer-events: none;

  .blok-title {
    margin-left: 20px;
  }
}

.c-top-container {
  position: absolute;
  left: 550px;
  right: 550px;
  top: 135px;
  height: 100px;
  background-size: 50% 100%;
  background-image: url("img/dashboard/bg-shuju.png");
  width: auto;
  pointer-events: none;
}

.c-bottom-container {
  position: absolute;
  left: 550px;
  right: 550px;
  width: auto;
  bottom: 30px;
  pointer-events: none;
}

.right-container {
  position: absolute;
  top: 80px;
  right: 10px;
  bottom: 30px;
  height: auto;
  width: 510px;
  pointer-events: none;
}</style>
