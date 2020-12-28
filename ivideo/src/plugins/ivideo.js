// 默认配置
export const defaultConfig = {
  width: 512,
  height: 288,
  autoFit: false,
  autoplay: false, // 如果为true,浏览器准备好时开始回放
  muted: false, // 默认情况下将会消除任何音频
  loop: false,
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
