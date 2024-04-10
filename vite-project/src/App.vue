<script setup lang="ts">
  import * as echarts from 'echarts'
  import { provide } from 'vue'

  provide('echarts',echarts)

</script>

<template>
  <router-view></router-view>
</template>

<style scoped>
html {
  font-size: 14px;
}
#app {
  height: 100%
}
</style>
