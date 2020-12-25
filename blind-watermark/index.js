/*
 * @Author: kim
 * @Date: 2020-12-25 10:07:53
 * @LastEditors: kim
 * @LastEditTime: 2020-12-25 12:03:49
 * @Description: 盲水印
 */
/**
 * @description: 将base64转换为文件
 * @param {string} dataurl 文件base64
 * @param {string} filename 文件名
 * @return {file} 
 */
function dataURLtoFile(dataurl, filename = 'demo') {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n > 0) {
    n -= 1
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, {
    type: mime
  })
}

/**
 * @description: 图片加水印
 * @param {Object} ctx canvas对象
 * @param {String} fontData 水印文字像素数据
 * @param {String} color 修改的通道
 * @param {String} originalData 图片像素数据
 * @return {*}
 */
const mergeData = function (ctx, fontData, color, originalData) {
  const oData = originalData.data
  let bit, offset // offset的作用是找到alpha通道值，这里需要大家自己动动脑筋

  switch (color) {
    case 'R':
      bit = 0
      offset = 3
      break
    case 'G':
      bit = 1
      offset = 2
      break
    case 'B':
      bit = 2
      offset = 1
      break
  }
  
  // 简述：文字图片像素数据没有信息的像素，奇数加1，偶数不变；有信息的像素，奇数不变，偶数加1。然后后期解密的时候只要把奇数拿出来处理即可。
  for (let i = 0; i < oData.length; i++) {
    if (i % 4 == bit) {
      // 只处理目标通道
      // 判断是否 R 为 0 和 图片该R位是否为奇数
      if (fontData[i + offset] === 0 && (oData[i] % 2 === 1)) {
        // 没有信息的像素，该通道最低位置0，但不要越界
        if (oData[i] === 255) {
          oData[i]--
        } else {
          oData[i]++
        }
      } else if (fontData[i + offset] !== 0 && (oData[i] % 2 === 0)) {
        oData[i]++
      }
    }
  }
  // 将处理后的数据放回画布
  ctx.putImageData(originalData, 0, 0)
}

/**
 * @description: 处理数据
 * @param {Object} ctx canvas对象
 * @param {String} originalData 待处理图片像素数据
 * @return {*}
 */
const processData = function (ctx, originalData) {
  const data = originalData.data
  for (var i = 0; i < data.length; i++) {
    if (i % 4 == 0) {
      // R分量
      if (data[i] % 2 == 0) {
        data[i] = 0
      } else {
        data[i] = 255
      }
    } else if (i % 4 == 3) {
      // alpha通道不做处理
      continue
    } else {
      // 关闭其他分量，不关闭也不影响答案
      data[i] = 0
    }
  }
  // 将结果绘制到画布
  ctx.putImageData(originalData, 0, 0)
}

/**
 * @description: 加盲水印
 * @param {Object} config 配置 {url: 待加水印图片地址|String, text: 水印文字|String}
 * @return {*}
 */
function encodeImg(config) {
  // 图片处理
  const img = new Image()
  img.onload = function () {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    // 水印设置
    ctx.font = '30px Microsoft Yahei'
    ctx.fillText(config.text, 60, 130)
    const textData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data
    // 获取指定区域的canvas像素信息
    ctx.drawImage(img, 0, 0);
    const originalData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
    // 加水印
    mergeData(ctx, textData, 'R', originalData)
    // console.log(canvas.toDataURL())
  }
  img.src = config.url
}

/**
 * @description: 水印图片加密
 * @param {String} src 图片地址
 * @return {*}
 */
function decodeImg(src) {
  const ctx = document.getElementById('canvas').getContext('2d');
  const img = new Image();
  img.onload = function () {
    // 获取指定区域的canvas像素信息
    ctx.drawImage(img, 0, 0);
    const originalData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    processData(ctx, originalData)
  };
  img.src = src
}