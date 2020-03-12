<template>
  <div>
    <router-link to="/">首页</router-link>&nbsp;&nbsp;
    <router-link to="/about">关于</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: "App"
  }
</script>

<style scoped>

</style>