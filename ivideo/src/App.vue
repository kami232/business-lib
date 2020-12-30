<template>
  <ivideo :options="options" />
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
    const options = reactive({
      
    })

    return {
      options,
    }
  },
}
</script>

<style>
</style>
