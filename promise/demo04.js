class Promise {
  callbacks = []
  state = 'pending'
  // 保存value主要解决then是延迟注册的时候，会导致访问不到上一次的结果值
  value = null
  constructor(fn) {
    fn(this._resolve.bind(this))
  }

  then(onFulfilled) {
    console.log(this.state);
    if(this.state === 'pending') {
      this.callbacks.push(onFulfilled)
    } else {
      onFulfilled(this.value)
    }
    return this
  }

  _resolve(value) {
    // 这里对比03，去掉了使用setTimeout，为什么呢？因为我们引入了state记录当前状态
    // 当resolve比then注册快，callback这时是为空的，但没有关系，后续注册then的时候如果状态改变了则 回调立即调用。
    // 如果 resolve比then注册慢，这时callback为不为空，因为then已经注册了，注册的时候如果发现状态没有改变只是把回调添加到数组而已。
    // 因为这样就可以变得可控，因此可以去掉之前使用的setTimeout，对比测试一和测试二的打印结果就明白了
    console.log('resolve--', this.state);
    this.state = 'fulfilled'
    this.value = value
    this.callbacks.forEach(fn => fn(value))
  }
}

const p = new Promise(resolve => {
  // 测试一
  // console.log('同步执行')
  // resolve('同步执行')

  // 测试二
  console.log('异步执行')
  setTimeout(() => {
    resolve('异步执行')
  }, 3000)

}).then(tip => {
  console.log('then1', tip)
}).then(tip => {
  console.log('then2', tip)
})

setTimeout(() => {
  p.then(tip => {
    console.log('then3', tip);
  })
}, 0)

// 基础版的promise已经成型。但也有一个问题就是，每次then方法都是返回当前实例，因此结果都是一样的。demo05解决

