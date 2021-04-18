/*
 * @LastEditors: kim
 * @LastEditTime: 2021-04-18 17:25:38
 * @Description: localstroage & sessionstroage 封装
 */
class Storage {
  constructor(storage) {
    this.storage = storage
  }

  /**
   * @description: 存储数据
   * @param {String} key 键
   * @param {any} value 值
   * @param {Number|null} expire 有效期,不传表示长期有效
   * @return {void}
   */
  setItem(key, value, expire = null) {
    let val = {
      data: value,
      expire
    }
    val = JSON.stringify(val)
    this.storage.setItem(key, val)
  }

  /**
   * @description: 存储多个数据
   * @param {Object} payload 数据对象 {key: value, ...}
   * @param {Array} expireArr 过期时间数组,顺序添加,若无限期则为null [expire, ...]
   * @return {void}
   */
  setItems(payload, expireArr = []) {
    if (typeof payload !== 'object' || Array.isArray(payload)) {
      throw new Error('payload is not object.')
    }

    if (!Array.isArray(expireArr)) {
      throw new Error('expireArr is not Array.')
    }

    Object.keys(payload).forEach((key, index) => {
      this.setItem(key, payload[key], expireArr[index])
    })
  }

  /**
   * @description: 获取对应的数据
   * @param {String} key
   * @return {any}
   */
  getItem(key) {
    let value = this.storage.getItem(key)
    value = JSON.parse(value)

    return value
  }

  /**
   * @description: 获取多个数据
   * @param {Array} keys key数组
   * @return {Object}
   */
  getItems(keys = []) {
    if (!Array.isArray(keys)) {
      throw new Error('keys is not array.')
    }

    let values = {}
    if (keys.length) {
      keys.forEach(key => {
        values[key] = this.getItem(key)
      })
    } else {
      Object.keys(this.storage).forEach(key => {
        values[key] = this.getItem(key)
      })
    }

    return values
  }

  /**
   * @description: 移除指定键值
   * @param {String} key
   * @return {void}
   */
  removeItem(key) {
    this.storage.removeItem(key)
  }

  /**
   * @description: 移除过期数据
   * @param {String} key 指定名字
   * @param {Boolean} isExact 是否是全匹配（精确）
   * @return {void}
   */
  removeExpireItem(key, isExact = true) {
    const keyRE = isExact ? new RegExp(`^${key}$`) : new RegExp(`${key}`, 'g')
    const currentTimeStamp = parseInt(Date.now() / 1000) // 当前时间
    Object.keys(this.storage).forEach(key => {
      if (!keyRE.test(key)) return

      const temp = this.getItem(key)
      // 判断是否过期
      if (temp.expire && temp.expire < currentTimeStamp) {
        this.removeItem(key)
      }
    })
  }

  /**
   * @description: 清除全部数据
   * @return {void}
   */
  clear() {
    this.storage.clear()
  }

  /**
   * @description: 判断当前key是否存在
   * @param {String} key
   * @return {Boolean}
   */
  isExistItem(key) {
    return this.getItem(key) ? true : false
  }

  /**
   * @description: 判断当前key是否过期
   * @param {String} key
   * @return {Boolean}
   */
  isExpire(key) {
    const currentTimeStamp = parseInt(Date.now() / 1000) // 当前时间
    const value = this.getItem(key)
    if (!value || !value.expire || value.expire <= currentTimeStamp) {
      return false
    }

    return true
  }
}

export const localStorage = new Storage(window.localStorage)
export const sessionStorage = new Storage(window.sessionStorage)