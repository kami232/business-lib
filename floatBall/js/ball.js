/*
 * @Author: kim
 * @Date: 2020-08-13 15:26:26
 * @LastEditTime: 2020-08-14 11:46:41
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cloudgame\src\js\ball.js
 */
const $ball = $('#ball')
const $toolBar = $('#ball > .tool-bar')
const _width = $(window).width(); // 窗口的宽度
const _height = $(window).height(); // 窗口的高度
const _ballW = $ball.width()
const _ballH = $ball.height()
let startEvt;
let moveEvt;
let endEvt;
let startX, startY, disX, disY, _left, _top;
let isClick = true;
let isUnfold = false; // 悬浮球是否处于展开状态
let timer = null;

// 工具栏配置
const toolBarConfig = {
  width: 174,
  animateTime: 200
}

if ('ontouchstart' in window) {
  startEvt = 'touchstart'
  moveEvt = 'touchmove'
  endEvt = 'touchend'
} else {
  startEvt = 'mousedown'
  moveEvt = 'mousemove'
  endEvt = 'mouseup'
}

/**
 * 自身移动一半动画
 * @param {number} left 移动的距离
 * @param {number} duration 几秒后执行
 * @param {function} fn 执行函数
 */
function moveHalfAnimate(left, duration) {
  const time = setTimeout(function () {
    isUnfold && hideToolBar()
    $ball.animate({
      left: `${left}px`,
      opacity: '0.5'
    }, 200)
  }, duration)

  return time
}

// 移动开始事件
$ball.on(startEvt, function (e) {
  // e.preventDefault()
  isClick = true
  startX = e.touches ? touch = e.touches[0].clientX : e.clientX
  startY = e.touches ? touch = e.touches[0].clientY : e.clientY
  disX = startX - $ball.offset().left // 初始触摸时，触摸点距离悬浮球左上角的距离
  disY = startY - $ball.offset().top // 初始触摸时，触摸点距离悬浮球左上角的距离

  timer && clearTimeout(timer)
  $ball.animate({
    opacity: '1'
  }, 200)
})

// 监听移动事件
$ball.on(moveEvt, function (e) {
  const x = e.touches ? e.touches[0].clientX : e.clientX // 当前触摸点的x坐标
  const y = e.touches ? e.touches[0].clientY : e.clientY // 当前触摸点的y坐标
  // 移动距离超过20才是有效移动，否则任务是点击
  if (Math.abs(startX - x) > 20 || Math.abs(startY - y) > 20) {
    isClick = false;
  }
  // 计算悬浮球相对屏幕左上角的距离
  _left = x - disX
  _top = y - disY
  // 限制边界
  if (_left < 0) {
    _left = 0
  } else if (_left > _width - $ball.offset().width) {
    _left = _width - $ball.offset().width
  }

  if (_top < 0) {
    _top = 0
  } else if (_top > _height - $ball.offset().height) {
    _top = _height - $ball.offset().height
  }

  $ball.css('left', `${_left}px`)
  $ball.css('top', `${_top}px`)
})

// 移动结束事件
$ball.on(endEvt, function (e) {
  _left = _left || 0
  if (_width / 2 >= _left) {
    _left = 0
  } else {
    _left = _width - $ball.offset().width
  }

  // 释放贴边
  const temp = _left > 0 ? _left + Math.floor($ball.offset().width / 2) : _left - Math.floor($ball.offset().width / 2)
  $ball.animate({
    left: `${_left}px`
  }, 200, 'ease-out')
  // 如果是在移动情况下，无操作2s后自动半透明
  timer = moveHalfAnimate(temp, 2000)

  // 如果是在点击情况下，无点击4s后自动半透明
  if (isClick) {
    clearTimeout(timer)
    timer = moveHalfAnimate(temp, 4000)

    isUnfold = !isUnfold
    if (isUnfold) {
      showToolBar()
    } else {
      hideToolBar()
    }
  }
})

// 显示悬浮框工具栏
function showToolBar() {
  $toolBar.find('.arrow').hide()

  if (_left <= 0) {
    $toolBar.removeClass('left')
    $toolBar.find('.arrow').eq(0).show()
    // 显示在右边
    $toolBar.addClass('right')
  } else {
    // 显示在左边
    $toolBar.removeClass('right')
    $toolBar.find('.arrow').eq(1).show()
    $toolBar.addClass('left')
  }
  // 展开动画
  $toolBar.animate({
    width: `${toolBarConfig.width}px`
  }, toolBarConfig.animateTime)
}

// 隐藏悬浮窗工具栏
function hideToolBar() {
  isUnfold = false
  // 收缩动画
  $toolBar.animate({
    width: `0px`
  }, toolBarConfig.animateTime, function () {
    $toolBar.removeClass('right')
    $toolBar.removeClass('left')
  })
}

// 工具栏点击事件
$toolBar.find('.item').on('click', function (e) {
  e.stopPropagation()
  const type = $(this).data('type')
  if (!type) return

  _toolsHandleEvent[type] && _toolsHandleEvent[type](e)
})

// 工具栏处理函数
const _toolsHandleEvent = {
  share() {
    window.addEventListener('copy', _copy);
    document.execCommand('copy');
    window.removeEventListener('copy', _copy);
  },
  add() {
    console.log('添加到桌面');
  },
  reload() {
    console.log('重启');
  }
}

function _copy(e) {
  e.preventDefault();
  const url = location.href;
  if (e.clipboardData) {
    e.clipboardData.setData('text/plain', url);
  } else if (window.clipboardData) {
    window.clipboardData.setData('Text', url);
  }
}