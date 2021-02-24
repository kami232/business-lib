class Promise {
  // 每个callbacks保存着当前promise的下一个then，比如初始promise保存的是then1，then1的promise保存的是then2的callback
  callbacks = []
  state = 'pending'
  value = null
  constructor(fn) {
    fn(this._resolve.bind(this))
  }

  then(onFulfilled) {
    return new Promise(resolve => {
      // 需要注意这里this的指向
      this._handle({
        // onFulfilled 为 then 回调
        onFulfilled: onFulfilled || null,
        // _resolve
        resolve: resolve
      })
    })
  }

  _handle(callback) {
    if (this.state === 'pending') {
      this.callbacks.push(callback)
      return
    }

    if (!callback.onFulfilled) {
      callback.resolve(this.value)
      return
    }

    // 执行当前then，并保存结果，用于传递给下一个then
    const ret = callback.onFulfilled(this.value)
    // 执行下一个then 的 resolve，相当于执行下一个then
    callback.resolve(ret)
  }

  _resolve(value) {
    this.state = 'fulfilled'
    this.value = value
    this.callbacks.forEach(callback => this._handle(callback))
  }
}

/**
 * @description: 模拟异步请求
 * @param {string} url 请求url
 * @param {number} time 请求耗时
 * @param {function} callback 回调函数
 */
const mockAjax = (url, time, callback) => {
  setTimeout(() => {
    callback(url + '异步请求耗时' + time + '秒')
  }, 1000 * time)
}

const p = new Promise(resolve => {
  mockAjax('getUserId', 1, function (result) {
    resolve(result)
  })
}).then(res => {
  const temp = 'then1' + res
  console.log(temp)
  // 这里演示的都是返回一个 value 值，但如果返回一个 新的promise的时候就会有问题了，demo06解析
  return temp
}).then(res => {
  console.log('then2', res)
})
