<template>
  <div class="waterfall-wrap">
    <WaterFall :hSpace="10" />
  </div>
</template>

<script>
import WaterFall from './components/WaterFall/index.vue'
export default {
  name: 'App',
  components: {
    WaterFall,
  },
}
</script>

<style scoped lang="scss">
.waterfall-wrap {
  padding: 10px;
}
</style>
