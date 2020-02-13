// 连接Observer和Compile的桥梁，能够订阅并收到每个属性变动的通知
class Watcher {
  /**
   *
   * @param vm vue对象
   * @param expOrFn 属性值或函数（未被解析）
   * @param cb 回调通知更新函数
   */
  constructor(vm, expOrFn, cb) {
    this.cb = cb;
    this.vm = vm;
    this.expOrFn = expOrFn;
    this.depIds = {}; // 订阅器id

    // 判断是否是函数
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = this.parseGetter(expOrFn.trim());
    }

    this.value = this.get();
  }

  /**
   * 更新
   */
  update() {
    this.run();
  }

  run() {
    const value = this.get();
    const oldVal = this.value;
    if (value !== oldVal) {
      this.value = value;
      this.cb.call(this.vm, value, oldVal);
    }
  }

  /**
   * 订阅器对象
   * @param dep
   */
  addDep(dep) {
    // 1. 每次调用run()的时候会触发相应属性的getter
    // getter里面会触发dep.depend()，继而触发这里的addDep
    // 2. 假如相应属性的dep.id已经在当前watcher的depIds里，说明不是一个新的属性，仅仅是改变了其值而已
    // 则不需要将当前watcher添加到该属性的dep里
    // 3. 假如相应属性是新的属性，则将当前watcher添加到新属性的dep里
    // 如通过 vm.child = {name: 'a'} 改变了 child.name 的值，child.name 就是个新属性
    // 则需要将当前watcher(child.name)加入到新的 child.name 的dep里
    // 因为此时 child.name 是个新值，之前的 setter、dep 都已经失效，如果不把 watcher 加入到新的 child.name 的dep中
    // 通过 child.name = xxx 赋值的时候，对应的 watcher 就收不到通知，等于失效了
    // 4. 每个子属性的watcher在添加到子属性的dep的同时，也会添加到父属性的dep
    // 监听子属性的同时监听父属性的变更，这样，父属性改变时，子属性的watcher也能收到通知进行update
    // 这一步是在 this.get() --> this.getVMVal() 里面完成，forEach时会从父级开始取值，间接调用了它的getter
    // 触发了addDep(), 在整个forEach过程，当前wacher都会加入到每个父级过程属性的dep
    // 例如：当前watcher的是'child.child.name', 那么child, child.child, child.child.name这三个属性的dep都会加入当前watcher
    if (!this.depIds.hasOwnProperty(dep.id)) {
      // 判断当前watcher是否没有此订阅器id
      // 添加订阅者
      dep.addSub(this);
      // 记录订阅器id
      this.depIds[dep.id] = dep;
    }
  }

  /**
   * 返回模板真实数据
   * @returns {*}
   */
  get() {
    // 因为模板编译数据的时候，触发了data的get方法而触发了addDep方法进行添加订阅者，然而Dep.target为watch对象，
    Dep.target = this;
    // 获取真实数据
    let value = this.getter.call(this.vm, this.vm);
    Dep.target = null;
    return value;
  }

  /**
   * 分析器
   * @param exp 属性值
   * @returns {function(*=): *}
   */
  parseGetter(exp) {
    if (/[^\w.$]/.test(exp)) return;

    const exps = exp.split('.');

    return function (obj) {
      for (let i = 0, len = exps.length; i < len; i++) {
        if (!obj) return;
        // 模板数据解析为真实数据
        obj = obj[exps[i]];
      }
      return obj;
    }
  }
}