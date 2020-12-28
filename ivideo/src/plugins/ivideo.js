/**
 * @description: 默认配置
 * 回调函数： playCallback: (status) => {} 暂停开始回调 false是播放中 true是暂停
 */
export const defaultConfig = {
  width: 512,
  height: 288,
  autoFit: false,
  autoplay: false, // 如果为true,浏览器准备好时开始回放
  muted: true, // 默认情况下将会消除任何音频
  loop: false,
  preload: 'metadata'
}

/**
 * @description: 设置css style
 * @param {*} el dom
 * @param {Object} cssObj css对象
 * @return {*}
 */
export const cssHelper = (el, cssObj) => {
  for (let i in cssObj) {
    el.style[i] = cssObj[i]
  }
}

/**
 * @description: 格式化视频时间
 * @param {number} duration 秒
 * @return {string} mm:ss
 */
export const filterDuration = duration => {
  if (!duration) return '00:00'

  const minute = Math.floor(duration / 60)
  const second = Math.floor(duration % 60)

  return `${minute >= 10 ? minute : ('0' + minute)}:${second >= 10 ? second : ('0' + second)}`
}