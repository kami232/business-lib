/**
 * @description: 解析url参数
 * @param {string} url 
 * @return {object}
 */
export const getURLParameters = url =>
  (url.match(/([^?=&]+)(=([^&]*))/g) || []).reduce(
    (a, v) => ((a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1)), a), {}
  )

/**
 * @description: 复制文本
 * @param {string} str 
 * @return {*}
 */
 export const copyToClipboard = str => {
  const el = document.createElement('textarea')
  el.value = str
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
  if (selected) {
    document.getSelection().removeAllRanges()
    document.getSelection().addRange(selected)
  }
}

/**
 * @description: 防抖
 * @param {function} fn 执行函数
 * @param {boolean} immediate 是否首次立即执行
 * @param {number} interval 间隔
 * @return {function}
 */
 export function debounce(fn, immediate = false, interval = 1000) {
  let timer = null

  return function() {
    if(immediate && !timer) {
      fn && fn.apply(this, arguments)
      timer = setTimeout(() => {
        timer = null
      }, interval)
      return
    }
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn && fn.apply(this, arguments)
    }, interval)
  }
}

/**
 * @description: 节流
 * @param {Function} fn 执行函数
 * @param {Number} interval 间隔
 * @return {Function}
 */
export function throttle(fn, interval = 0) {
  let timer = null
  return function () {
    if(timer) return
    if(interval) {
      timer = setTimeout(() => {
        clearTimeout(timer)
        timer = null
      }, interval)
    } else {
      timer = true
    }
    fn && fn.apply(this, arguments)
    !interval && (timer = false)
  }
}