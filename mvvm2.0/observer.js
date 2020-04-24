// 监听器
class Observe {
  constructor(data) {
    const dep = new Dep();
    this.handle = {
      set: (target, property, value, receiver) => {
        // 判断新值是否等于旧值
        if (target[property] === value) {
          return false;
        }
        target[property] = value;
        dep.notify(); // 数据变化，通知所有订阅者
        return true;
      },
      get: (target, property, receiver) => {
        // 只有wather初始化的时候才添加订阅器
        if (Dep.target) { // 判断是否需要添加订阅者 Dep.target== wather的this
          dep.addSub(Dep.target); // 添加一个订阅者
        }
        return target[property];
      }
    }
    // 监听每一个数据
    this.data = this.defineReactive(data);
  }

  // 利用proxy监听data，循环遍历监听data下所有对象，并返回proxy
  // 注：因为proxy与Object.defineProperty不同，可以监听一个对象，但一个对象的深层对象会监听不到，所有需要遍历监听所有引用类型的。
  defineReactive(data) {
    if (!data || typeof data !== "object") {
      return data;
    }

    Object.keys(data).forEach(key => {
      data[key] = this.defineReactive(data[key]);
    });

    return new Proxy(data, this.handle);
  }
}

// 订阅者
class Dep {
  constructor() {
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  notify() {
    this.subs.forEach(sub => {
      sub.update();
    })
  }
}

Dep.target = null;
