const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';

class MyPromise {
  constructor(fn) {
    this.state = PENDING; // promise状态
    this.value = null; // 保存resolve或者reject中传入的值
    this.resolveCallbacks = []; // 保存then回调
    this.rejectedCallbacks = [];

    try {
      fn(this.resolve.bind(this), this.reject.bind(this));
    } catch (e) {
      this.reject(e);
    }
  }

  resolve(value) {
    // 判断value是否为MyPromise类
    if (value instanceof MyPromise) {
      return value.then(this.resolve, this.reject)
    }
    // setTimeout保证执行顺序
    setTimeout(() => {
      if (this.state === PENDING) {
        this.state = RESOLVED; // 修改状态
        this.value = value;
        this.resolveCallbacks.map(cb => cb(this.value));
      }
    }, 0);
  }

  reject(value) {
    setTimeout(() => {
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.value = value;
        this.rejectedCallbacks.map(cb => cb(this.value));
      }
    }, 0);
  }

  then(onFulfilled, onRejected) {
    const self = this;
    let promise2;
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : r => {
      throw r;
    }

    if (self.state === PENDING) {
      // 返回一个新的promise
      return (promise2 = new MyPromise((resolve, reject) => {
        self.resolveCallbacks.push(() => {
          try {
            const x = onFulfilled(self.value);
            self.resolutionProcedure(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        })

        self.rejectedCallbacks.push(() => {
          try {
            const x = onRejected(self.value);
            self.resolutionProcedure(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        })
      }))
    }

    // 如果then方法没有实例方法内部快，则直接进行此方法
    if (self.state === RESOLVED) {
      // 返回新的promise
      return (promise2 = new MyPromise((resolve, reject) => {
        setTimeout(() => {
          try {
            const x = onFulfilled(self.value);
            self.resolutionProcedure(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        })
      }))
    }

    if (self.state === REJECTED) {
      return (promise2 = new MyPromise((resolve, reject) => {
        setTimeout(() => {
          try {
            const x = onRejected(self.value);
            self.resolutionProcedure(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        })
      }))
    }
  }

  // 兼容多种promise
  resolutionProcedure(promise2, x, resolve, reject) {
    // 判断promise2不能与x相对，否则会发生循环引用问题
    if (promise2 === x) {
      return reject(new TypeError('Error'));
    }

    if (x instanceof MyPromise) {
      x.then((value) => {
        this.resolutionProcedure(promise2, value, resolve, reject)
      }, reject);
    }
  }
}

new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 2000);
}).then(value => {
  console.log(value);
})