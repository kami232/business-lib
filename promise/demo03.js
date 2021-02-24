class Promise {
  callbacks = []
  constructor(fn) {
    fn(this._resolve.bind(this))
  }

  then(onFulfilled) {
    this.callbacks.push(onFulfilled)
    return this
  }

  _resolve(value) {
    // 对比demo01和03，假如这里不使用setTimeout，当用以下实例进行调试的时候，会发现then没有注册完毕。
    // 这里使用setTimeout，是有利用到event loop的原理，保证then的注册在resolve之前就注册完毕
    setTimeout(() => {
      this.callbacks.forEach(fn => fn(value))
    }, 0)
  }
}

const p = new Promise(resolve => {
  console.log('同步执行')
  resolve('同步执行')
}).then(tip => {
  console.log('then1', tip)
}).then(tip => {
  console.log('then2', tip)
})

// 当我们对then加延迟后，就会发现打印不出来了，demo04解释
// setTimeout(() => {
//   p.then(tip => {
//     console.log('then3', tip);
//   })
// })