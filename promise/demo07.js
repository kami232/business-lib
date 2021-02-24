class Promise {
  callbacks = []
  state = 'pending'
  value = null
  constructor(fn) {
    fn(this._resolve.bind(this), this._reject.bind(this))
  }

  then(onFulfilled, onRejected) {
    console.log('then')
    return new Promise((resolve, reject) => {
      // 需要注意这里this的指向
      this._handle({
        // onFulfilled 为 then 回调
        onFulfilled: onFulfilled || null,
        onRejected: onRejected || null,
        // _resolve
        resolve: resolve,
        // _reject
        reject: reject
      })
    })
  }

  _handle(callback) {
    console.log('_handle')
    if (this.state === 'pending') {
      this.callbacks.push(callback)
      return
    }

    // 判断当前状态
    let cb = this.state === 'fulfilled' ? callback.onFulfilled : callback.onRejected

    // then没有对应的回调时
    if(!cb) {
      cb = this.state === 'fulfilled' ? callback.resolve : callback.reject
      cb(this.value)
      return
    }

    const ret = cb(this.value)
    cb = this.state = 'fulfilled' ? callback.resolve : callback.reject
    cb(ret)
  }

  _resolve(value) {
    console.log('_resolve')
    if (value && (typeof value === 'object' || typeof value === 'function')) {
      const then = value.then
      if (typeof then === 'function') {
        then.call(value, this._resolve.bind(this), this._reject.bind(this))
        return
      }
    }

    this.state = 'fulfilled'
    this.value = value
    this.callbacks.forEach(callback => this._handle(callback))
  }

  _reject(error) {
    this.state = 'rejected'
    this.value = error
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