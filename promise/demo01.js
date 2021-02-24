class Promise {
  callbacks = []
  constructor(fn) {
    fn(this._resolve.bind(this))
  }

  then(onFulfilled) {
    this.callbacks.push(onFulfilled)
    // 这里return this 是因为可以进行链式调用
    return this
  }

  _resolve(value) {
    this.callbacks.forEach(fn => fn(value))
  }
}

// 解析：resolve相当于传入了 _resolve 函数，然后再执行resolve的时候 传入了value
const p = new Promise(resolve => {
  setTimeout(() => {
    console.log('done')
    resolve('5秒')
  }, 5000)
}).then(tip => {
  console.log(tip)
}).then(tip => {
  console.log(tip)
})