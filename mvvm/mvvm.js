class MVVM {
  /**
   *
   * @param options 参数
   */
  constructor(options) {
    this.$options = options || {};
    // 获取参数中的data
    let data = this._data = this.$options.data;
    let self = this;

    // 数据代理
    // 实现 vm.xxx -> vm._data.xxx
    Object.keys(data).forEach(function (key) {
      self._proxyData(key);
    });

    // 初始化计算属性
    this._initComputed();
    // 监听data
    observe(data, this);

    // 解析模板，类似vue的el属性
    this.$compile = new Compile(options.el || document.body, this)
  }

  $watch(key, cb, options) {
    new Watcher(this, key, cb);
  }

  /**
   * 代理数据
   * @param key 属性名
   * @param setter
   * @param getter
   * @private
   */
  _proxyData(key, setter, getter) {
    const self = this;
    setter = setter ||
      Object.defineProperty(self, key, {
        configurable: false,
        enumerable: true,
        get: function proxyGetter() {
          return self._data[key];
        },
        set: function proxySetter(newVal) {
          self._data[key] = newVal;
        }
      });
  }

  _initComputed() {
    const self = this;
    // 获取计算属性
    let computed = this.$options.computed;
    // 判断是否是对象
    if (typeof computed === 'object') {
      Object.keys(computed).forEach(function (key) {
        Object.defineProperty(self, key, {
          get: typeof computed[key] === 'function'
            ? computed[key]
            : computed[key].get,
          set: function () {
          }
        });
      });
    }
  }
}