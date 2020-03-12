let Vue;

class myRouter {
  constructor(opt) {
    this.$options = opt

    // 创建一个路由的path和route映射
    this.routeMap = {}

    // 将当前路径current响应式
    this.app = new Vue({
      data: {
        current: '/'
      }
    })
  }

  init() {
    // 绑定浏览器监听事件
    this.bindEvents()
    // 解析路由配置
    this.createRouteMap(this.$options)
    // 创建router-link 和 router-view
    this.initComponent()
  }

  bindEvents() {
    // 监听hashchange事件
    window.addEventListener('hashchange', this.onHashChange.bind(this))
    window.addEventListener('load', this.onHashChange.bind(this))
  }

  // 当hash锚点改变时触发
  onHashChange() {
    this.app.current = window.location.hash.slice(1) || '/'
    console.log(this.app.current);
  }

  // 创建路由映射，属性名为路径，值为该对象
  createRouteMap(opt) {
    opt.routes.forEach(item => {
      this.routeMap[item.path] = item
    })
  }

  // 创建两个全局组件
  initComponent() {
    // router-link 渲染为一个a标签，接收一个to props，href为设置的to属性的值
    Vue.component('router-link', {
      props: {
        to: String
      },
      render(h) {
        return h('a', {attrs: {href: '#' + this.to}}, this.$slots.default)
      }
    })

    // router-view 渲染对应路径下的组件
    Vue.component('router-view', {
      render: h => {
        const comp = this.routeMap[this.app.current].component
        return h(comp)
      }
    })
  }
}

myRouter.install = function (_Vue) {
  Vue = _Vue

  Vue.mixin({
    beforeCreate() {
      // 这里的代码将来会再外面初始化的时候被调用
      // 这样外面就实现了Vue扩展
      // 这里的this就是Vue实例
      // 但是这里会在所有组件的创建过程中都执行，所以这里不健壮
      // Vue.prototype.$router = this.$options.router

      // 这里只希望根组件执行一次
      // 判断是否有router属性
      if (this.$options.router) {
        Vue.prototype.$router = this.$options.router
        // 路由进行初始化
        this.$options.router.init()
      }
    }
  })
}

export default myRouter