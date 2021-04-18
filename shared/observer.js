class NameSpace {
  constructor(namespace) {
    this.namespace = namespace
    this.cache = {}
  }

  /**
   * @description: 订阅
   * @param {String} key
   * @param {Function} fn
   * @return {void}
   */
  listen(key, fn){
    if(!this.cache[key]) {
      this.cache[key] = []
    }

    this.cache[key].push(fn)
  }

  /**
   * @description: 发布
   * @param {String} key 
   * @param {Array} rest
   * @return {*}
   */
  trigger(key, ...rest){
    const stack = this.cache[key]

    if(!stack || !stack.length) return
    
    for(let i = 0, len = stack.length; i < len; i++) {
      stack[i].apply(stack[i], ...rest)
    }
  }

  /**
   * @description: 只订阅一次
   * @param {String} key
   * @param {Function} fn
   * @return {void}
   */
  one(key, fn) {
    const onceFn = () => {
      fn()
      this.remove(key)
    }

    this.listen(key, onceFn)
  }

  /**
   * @description: 移除订阅
   * @param {String} key
   * @param {Function} fn
   * @return {void}
   */
  remove(key, fn) {
    if(this.cache[key]) {
      if(fn) {
        for (let i = this.cache[key].length; i >= 0; i--) {
          if (this.cache[key][i] === fn) {
            this.cache[key].splice(i, 1);
          }
        }
      } else {
        this.cache[key] = []
      }
    }
  }
}

class Observer {
  constructor() {
    this._defaultNameSpace = 'default'
    this.namespaceCache = {}
  }

  create(namespace) {
    const name = namespace || this._defaultNameSpace

    if(!this.namespaceCache[name]) {
      this.namespaceCache[name] = new NameSpace()
      
    }

    return this.namespaceCache[name]
  }
}

export default new Observer() 
