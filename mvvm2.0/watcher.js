class Watcher {
  /**
   *
   * @param vm 实例
   * @param exp
   * @param cb 回调
   */
  constructor(vm, exp, cb) {
    this.vm = vm;
    this.exp = exp;
    this.cb = cb;
    this.value = this.get(); // 将自己添加到订阅器的操作（获取当前值）
  }

  update() {
    this.run();
  }

  run() {
    // 获取当前的值
    const value = this.vm.data[this.exp];
    // 获取旧值
    const oldVal = this.value;
    // 如果新值和旧值不一样的话
    if (value !== oldVal) {
      this.value = value; // 记录当前值
      this.cb.call(this.vm, value, oldVal); // 通知回调
    }
  }

  get() {
    Dep.target = this; // 缓存自己
    const value = this.vm.data[this.exp]; // 强制执行数据监听器里的get函数
    Dep.target = null; // 释放自己
    return value;
  }
}