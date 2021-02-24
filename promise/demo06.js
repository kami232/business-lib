class Promise {
  // 每个callbacks保存着当前promise的下一个then，比如初始promise保存的是then1，then1的promise保存的是then2的callback
  callbacks = []
  state = 'pending'
  value = null
  constructor(fn) {
    fn(this._resolve.bind(this))
  }

  then(onFulfilled) {
    console.log('then')
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
    console.log('_handle')
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
    console.log('_resolve')
    // 判断传递过来的值（上一个then）是否是函数或者对象
    if (value && (typeof value === 'object' || typeof value === 'function')) {
      const then = value.then
      if (typeof then === 'function') {
        // 注意这个this，这个this指向当前then，在return promise的时候，那个promise执行的是这个then的方法，比如then1返回一个promise，该promise的onFifillled的函数是then1的_resolve
        // 这里可以理解为执行一下返回promise的then，为了获取resolve的值
        then.call(value, this._resolve.bind(this))
        return
      }
    }

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
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('then1-res')
    }, 2000)
  })
}).then(res => {
  console.log('then2', res)
})

// demo06完成了新的链式调用，接下来就是添加上reject的逻辑，demo07