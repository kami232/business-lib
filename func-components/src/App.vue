<template>
  <!-- <div class="waterfall-wrap">
    <WaterFall :hSpace="10" />
  </div> -->
  <drag-sort />
</template>

<script>
// import WaterFall from './components/WaterFall/index.vue'
import DragSort from './components/DragSort/index.vue'
export default {
  name: 'App',
  components: {
    // WaterFall,
    DragSort,
  },
}
</script>

<style scoped lang="scss">
.waterfall-wrap {
  padding: 10px;
}
</style>
