/*
 * @Author: kim
 * @Date: 2020-12-24 23:12:15
 * @LastEditors: kim
 * @LastEditTime: 2020-12-25 09:53:47
 * @Description: 生成明水印
 */
const defaultConfig = {
  container: '', // 水印容器 默认加入到body
  draw: 'auto', // 绘制 auto自动 none不自动添加，则返回数据流图片，和提供监听dom方法
  renderer: 'canvas', // 绘制方法 canvas or svg
  opacity: 0.2, // 透明度
  color: '#000', // 字体颜色
  text: '', // 水印文本
  canDel: false, // 是否可以删除, draw为 auto时生效
}

// 绘制方法
const renderer = {
  canvas: function (config) {
    const angle = -20
    const canvas = document.createElement('canvas')
    canvas.width = 180
    canvas.height = 100
    const cxt = canvas.getContext('2d')
    cxt.clearRect(0, 0, 180, 100)
    cxt.fillStyle = config.color
    cxt.globalAlpha = config.opacity // 透明度
    cxt.font = '16px serif'
    cxt.rotate(Math.PI / 180 * angle)
    cxt.fillText(config.text, 0, 50) // 绘制文本
    return canvas.toDataURL()
  },
  svg: function (config) {
    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="180px" height="100px">
      <text x="0px" y="30px" dy="16px"
      text-anchor="start"
      stroke="${config.color}"
      stroke-opacity="${config.opacity}"
      fill="none"
      transform="rotate(-20)"
      font-weight="100"
      font-size="16"
      >
      	${config.text}
      </text>
    </svg>`
    return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svgStr)))}`
  }
}

/**
 * @description: 监听dom改变
 * @param {Object} targetNode 需要监听的DOM
 * @param {Object} waterMarkNode 观察的目标节点
 */
const bindMutations = function (targetNode, waterMarkNode) {
  if(!targetNode || !waterMarkNode) return
  // 观察器的配置（需要观察什么变动）
  const config = {
    attributes: true,
    childList: true,
    subtree: true
  }

  /**
   * @description: 监听回调
   * @param {Array} mutationsList 描述所有被触发改动的 MutationRecord 对象数组
   * @param {Object} observer 调用该函数的 MutationObserver 对象
   */
  const callback = function (mutationsList, observer) {
    for (let mutation of mutationsList) {
      mutation.removedNodes.forEach(function (item) {
        if (item === waterMarkNode) {
          targetNode.appendChild(waterMarkNode);
        }
      })
    }
  }
  // 创建一个观察器实例并传入回调函数
  const observer = new MutationObserver(callback);
  // 以上述配置开始观察目标节点
  observer.observe(targetNode, config);
}

/**
 * @description: 生成明水印
 * @param {Object} c 配置
 * @return {String} 数据流图片
 */
function createWaterMark(c = {}) {
  const config = Object.assign({}, defaultConfig, c)
  const dataImage = renderer[config.renderer] ? renderer[config.renderer](config) : renderer['canvas'](config)

  if(config.draw === 'auto') {
    let target = document.getElementsByTagName('body')[0]
    const watermark = document.createElement('div')
    watermark.className = 'watermark'
    watermark.style.backgroundImage = `url(${dataImage})`
    if (config.container) {
      target = target.querySelector(config.container)
    }
    target && target.appendChild(watermark)
  
    !config.canDel && bindMutations(target, watermark)
  }
  
  return dataImage
}