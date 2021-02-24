class Promise {
  callbacks = []
  constructor(fn) {
    fn(this._resolve.bind(this))
  }

  then(onFulfilled) {
    this.callbacks.push(onFulfilled)
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
})

p.then(tip => {
  console.log('then1', tip)
})

p.then(tip => {
  console.log('then2', tip)
})