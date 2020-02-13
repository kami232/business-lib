let uid = 0;

/**
 * 观察对象所有属性, 类vue的data
 * @param value 值
 * @param 当前实例对象，类似vue对象
 */
function observe(value, vm) {
  // 判断是否有值或是否是对象
  if (!value || typeof value !== 'object') {
    return;
  }

  return new Observer(value);
};

// 监听所有属性
class Observer {
  constructor(data) {
    // 监听的数据
    this.data = data;
    // 第一步，遍历所有数据
    this.walk(data);
  }

  /**
   * 遍历数据所有可枚举属性
   * @param data 监听的数据
   */
  walk(data) {
    const self = this;
    // 遍历数据所有可枚举的属性
    Object.keys(data).forEach(key => {
      self.convert(key, data[key]);
    });
  }

  /**
   * 转换
   * @param key 属性名
   * @param val 值
   */
  convert(key, val) {
    this.defineReactive(this.data, key, val);
  }

  /**
   *
   * @param data 定义属性的对象
   * @param key 属性名
   * @param val 值
   * @returns {*}
   */
  defineReactive(data, key, val) {
    let dep = new Dep();
    let childObj = observe(val); // 监听子属性

    Object.defineProperty(data, key, {
      enumerable: true, // 当且仅当该属性的 configurable 为 true 时，该属性描述符才能够被改变，同时该属性也能从对应的对象上被删除。默认为 false。
      configurable: false, // 当且仅当该属性的enumerable为true时，该属性才能够出现在对象的枚举属性中。默认为 false。
      get() {
        // 判断是否有Dep.target值（是否已经添加了该订阅者），有则执行depend方法
        Dep.target && dep.depend();
        return val;
      },
      set(newVal) {
        // 判断新值是否等于旧值，如果是则不处理
        if (newVal === val) {
          return;
        }
        val = newVal;
        // 新的值是object的话，进行监听子属性
        childObj = observe(newVal);
        // 通知订阅者
        dep.notify();
      }
    });
  }
}

// 订阅器
class Dep {
  constructor() {
    this.id = uid++; // id唯一值
    this.subs = []; // 订阅者数组
  }

  /**
   * 添加订阅者
   * @param sub 订阅者
   */
  addSub(sub) {
    this.subs.push(sub);
  }

  depend() {
    Dep.target.addDep(this);
  }

  /**
   * 移除订阅者
   * @param sub
   */
  removeSub(sub) {
    // 查找该订阅者在订阅者数组的索引
    const index = this.subs.indexOf(sub);
    if (index != -1) {
      // 移除
      this.subs.splice(index, 1);
    }
  }

  // 通知订阅者数据变化
  notify() {
    //遍历订阅者数组更新
    this.subs.forEach(sub => {
      sub.update();
    });
  }
}

Dep.target = null;