class SelfVue {
  constructor(opts) {
    this.vm = this;
    const ob = new Observe(opts.data);
    this.data = ob.data;
    // 此步骤是代理this.data，以至于无需this.data.xxx才可以访问到data的属性，可以直接this.xxx
    Object.keys(this.data).forEach(key => {
      this._proxyKeys(key);  // 绑定代理属性
    });
    new Compile(opts.el, this.vm);
    return this;
  }

  _proxyKeys(key) {
    const self = this;
    // 监听this
    Object.defineProperty(this, key, {
      get() {
        return self.data[key];
      },
      set(newVal) {
        self.data[key] = newVal;
      }
    });
  }
}