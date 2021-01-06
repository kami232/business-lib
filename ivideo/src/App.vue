<template>
  <ivideo :dataSource="dataSource" />
</template>

<script>
import { reactive } from 'vue'
import ivideo from './plugins/ivideo.vue'

export default {
  name: 'App',
  components: {
    ivideo,
  },
  setup() {
    const dataSource = reactive([
      {
        type: 'video/mp4',
        url: 'https://huohucloud.9ishouyou.com/video/sp1.mp4'
      }
    ])

    return {
      dataSource,
    }
  },
}
</script>

<style>
</style>
