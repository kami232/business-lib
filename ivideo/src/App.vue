<template>
  <ivideo :options="{autoFit: false}" />
</template>

<script>
import ivideo from './plugins/ivideo.vue'

export default {
  name: 'App',
  components: {
    ivideo
  }
}
</script>

<style>
</style>
