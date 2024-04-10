<template>
  <div class="_full">
    <HomeBackground></HomeBackground>
    <!-- Three continer -->
    <div ref="d3El"  class="_full"></div>
    <!-- :style="{ cursor: buildingStore.store.cursor }" -->
  </div>

</template>

<script lang="ts" setup>
// import { ref, onMounted, onBeforeUnmount } from "vue";
import { ref } from "vue";
import HomeBackground from '@/pages/dashboard/HomeBackground.vue'

// 通过ref获取dom元素,定义一个和div中ref名字一样的变量名即可
const d3El = ref<HTMLElement>(); 

</script>

<style lang="scss" scoped>
</style>