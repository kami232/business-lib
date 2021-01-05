/*
 * @Author: kim
 * @Date: 2020-12-29 16:48:12
 * @LastEditors: kim
 * @LastEditTime: 2021-01-05 18:34:13
 * @Description: 自定义播放器逻辑文件
 */
import {
  reactive,
  ref,
  computed,
  watch
} from 'vue'
import {
  isEqual as _isEqual,
  isElement as _isElement,
  isFunction as _isFunction
} from 'lodash'
import {
  cssHelper,
  toFullVideo,
  exitFullscreen,
  isNodeContain,
} from '@/assets/js/utils.js'
import {
  defaultConfig
} from '@/assets/js/config.js'


export default function (props) {
  const videoWrapRef = ref(null) // 父容器引用
  const videoRef = ref(null) // video 引用
  const videoControlRef = ref(null) // video 控制台 引用
  const state = reactive({
    duration: 0, //视频时长
    isPaused: true, // 是否处于暂停
    isMuted: false, // 是否静音
    isFullScreen: false, // 是否处于全屏状态
    controlVisiable: true, // 控制台是否显示
    speedMenuVisiable: false, // 速率菜单显隐
    volume: 1, // 当前音量
    volumeControlVisiable: false, // 音量控制显隐
    dotVisiable: false, // 进度条拖拽点显隐
    speed: {
      label: '1.0x',
      value: 1
    }, // 当前的速率
    currentTime: 0, // 当前播放时间，秒
  })
  let controlTimer = null // 控制台timer
  let speedTimer = null
  let volumeBlurTimer = null // 音量失焦timer
  let progressBarW = 0 // 进度条总长度
  // 音量触摸事件
  const volumeData = {
    touch: false,
    wrapRect: null, // 音量控件的高度
  }

  // 合并配置
  const config = computed(() =>
    Object.assign({}, defaultConfig, props)
  )

  // 监听配置的变化
  watch(config, (newValue, oldValue) => {
    const keys = Object.keys(newValue)

    keys.forEach(key => {
      // 如果是dom或函数不参与比较
      if (_isElement(newValue[key]) || _isFunction(newValue[key])) return

      if (_isEqual(newValue[key], oldValue[key])) {
        return
      }

      if (key === 'size' && newValue.autoFit) {
        return
      }
      _setVideo[key] && _setVideo[key](newValue[key])
    })
  }, {
    deep: true
  })

  // 设置播放器, key要与配置项相同
  const _setVideo = {
    /**
     * @description: 设置尺寸
     * @param {object} size 宽高
     */
    size: size => {
      const styleObj = {
        width: `${size.width}px`,
        height: `${size.height}px`,
      }
      cssHelper(videoWrapRef.value, styleObj)
    },
    /**
     * @description: 设置窗口自适应
     * @param {boolean} autoFit
     */
    autoFit: autoFit => {
      if (typeof autoFit !== 'boolean') return

      const styleObj = {
        width: `100%`,
        height: `100%`,
      }
      cssHelper(videoWrapRef.value, styleObj)
    },
    /**
     * @description: 设置自动播放
     * @param {boolean} autoplay
     */
    autoplay: autoplay => {
      videoRef.value.autoplay = autoplay
      autoplay && (state.isPaused = false)
    },
    /**
     * @description: 设置静音
     * @param {boolean} muted
     */
    muted: muted => {
      videoRef.value.muted = muted
      state.isMuted = muted
    },
    /**
     * @description: 设置音量
     * @param {number} volume
     */
    volume: volume => {
      state.volume = volume
      videoRef.value.volume = volume
      videoControlRef.value.querySelector('.volume-progress').style.transform = `scaleY(${volume})`
      videoControlRef.value.querySelector('.volume-dot').style.top = `${(1 - volume) * volumeData.wrapRect.height}px`
    },
    /**
     * @description: 设置循环播放
     * @param {boolean} loop
     */
    loop: loop => {
      videoRef.value.loop = loop
    },
    /**
     * @description: 设置preload
     * @param {string} preload
     */
    preload: preload => {
      videoRef.value.preload = preload
    },
    /**
     * @description: 设置速率
     * @param {object} obj 速率配置
     */
    speed: obj => {
      if (obj.options && obj.options.length) {
        const speed = obj.options.find(item => item.value === obj.defaultValue)
        if (!speed) {
          throw new Error('There are no defaultValue in the options')
        }
        state.speed = speed
        videoRef.value.playbackRate = speed.value
      }
    }
  }

  /**
   * @description: 基础设置
   */
  const _handleSetting = () => {
    videoRef.value.controls = false
    _setVideo['volume'](1)
    // 设置控制栏是否显示
    state.controlVisiable = Boolean(config.value.controls)

    if (config.value.autoFit) {
      _setVideo['autoFit'](config.value.autoFit)
    } else {
      _setVideo['size'](config.value.size)
    }

    // 自动播放
    _setVideo['autoplay'](config.value.autoplay)
    // 静音
    _setVideo['muted'](config.value.muted)
    _setVideo['loop'](config.value.loop)
    _setVideo['preload'](config.value.preload)
    _setVideo['speed'](config.value.speed)
  }

  /**
   * @description: 进度条焦点
   * @param {Object} e
   */
  const handleFocusProgress = () => {
    state.dotVisiable = true
  }

  /**
   * @description: 进度条失去焦点
   */
  const handleBlurProgress = () => {
    state.dotVisiable = false
  }

  /**
   * @description: 处理播放和暂停
   */
  const handlePlayAndPause = () => {
    const isPaused = videoRef.value.paused
    if (isPaused) {
      videoRef.value.play()
    } else {
      videoRef.value.pause()
    }
    state.isPaused = !isPaused
    config.value.playCallback && config.value.playCallback(!isPaused)
  }

  /**
   * @description: 处理静音
   */
  const handleMuted = () => {
    const isMuted = videoRef.value.muted

    _setVideo['muted'](!isMuted)
    config.value.mutedCallback && config.value.mutedCallback(!isMuted)
  }

  /**
   * @description: 音量移入
   */
  const handleHoverVolume = () => {
    clearTimeout(volumeBlurTimer)
    state.volumeControlVisiable = true
  }

  /**
   * @description: 音量移出
   * @param {object} e
   */
  const handleBlurVolume = () => {
    clearTimeout(volumeBlurTimer)
    volumeBlurTimer = setTimeout(() => {
      state.volumeControlVisiable = false
    }, 500)
  }

  /**
   * @description: 计算音量比值
   * @param {object} e 事件对象
   * @return {*}
   */
  const _computedVolume = e => {
    const diffY = e.clientY - volumeData.wrapRect.y >= 0 ? e.clientY - volumeData.wrapRect.y : 0
    let diff = volumeData.wrapRect.height - diffY
    diff = diff >= 0 ? diff : 0
    const volume = (diff / volumeData.wrapRect.height).toFixed(2)
    _setVideo['volume'](volume)
  }

  /**
   * @description: 音量触摸开始
   * @param {object} e 事件对象
   * @return {*}
   */
  const handleTouchStartVolume = e => {
    volumeData.wrapRect = videoControlRef.value.querySelector('.volume-bar-wrap').getBoundingClientRect()
    volumeData.touch = true
    // TODO 改变音量
    _computedVolume(e)
  }

  /**
   * @description: 音量触摸移动
   * @param {object} e 事件对象
   */
  const handleTouchMoveVolume = e => {
    if (!volumeData.touch) return
    _computedVolume(e)
  }

  /**
   * @description: 音量触摸结束
   * @param {object} e 事件对象
   */
  const handleTouchEndVolume = () => {
    volumeData.touch = false
  }

  /**
   * @description: 处理全屏和取消横屏
   */
  const handleFullScreen = () => {
    if (state.isFullScreen) {
      exitFullscreen()
    } else {
      toFullVideo(videoWrapRef.value)
    }
  }

  /**
   * @description: 鼠标移动事件
   * @param {Object} e 事件参数
   */
  const handleMousemoveVideo = e => {
    if (!config.value.controls) return

    state.controlVisiable = true
    clearTimeout(controlTimer)
    if (isNodeContain(videoControlRef.value, e.target)) return
    controlTimer = setTimeout(() => {
      state.controlVisiable = false
    }, 1000)
  }

  /**
   * @description: 鼠标移出事件
   */
  const handleMouseoutVideo = () => {
    if (!config.value.controls) return

    clearTimeout(controlTimer)
    controlTimer = setTimeout(() => {
      state.controlVisiable = false
    }, 1000)
  }

  /**
   * @description: 倍率移入
   */
  const handleHoverSpeed = () => {
    if (!config.value.speed || !config.value.speed.options || !config.value.speed.options.length) return
    clearTimeout(speedTimer)
    state.speedMenuVisiable = true
  }

  /**
   * @description: 倍率移出
   */
  const handleBlurSpeed = () => {
    if (!config.value.speed || !config.value.speed.options || !config.value.speed.options.length) return
    clearTimeout(speedTimer)
    speedTimer = setTimeout(() => {
      state.speedMenuVisiable = false
    }, 500)
  }

  /**
   * @description: 倍率菜单点击
   * @param {Object} e 事件对象
   */
  const handleClickSpeedMenu = e => {
    if (state.speed.value == e.target.dataset.value) {
      state.speedMenuVisiable = false
      return
    }
    const speedValue = e.target.dataset.value
    const speed = config.value.speed.options.find(item => item.value == speedValue)
    if (!speed) return
    state.speed = speed
    // TODO 修改倍率
    videoRef.value.playbackRate = speed.value
    state.speedMenuVisiable = false
  }

  /**
   * @description: 监听视频可以播放回调
   */
  const _handleCanPlay = () => {
    state.duration = videoRef.value.duration || 0
  }

  /**
   * @description: 监听全屏事件
   */
  const _handleScreen = () => {
    state.isFullScreen = document.fullscreenElement == videoWrapRef.value ? true : false
    progressBarW = videoControlRef.value.querySelector('.ivideo-progress-bar').clientWidth // 获取进度条长度
    // 移动进度点
    const ratio = (state.currentTime / state.duration).toFixed(4)
    const dotLeft = progressBarW * ratio
    videoControlRef.value.querySelector('.bar-progress-dot').style.left = `${dotLeft}px`
  }

  /**
   * @description: 监听播放完成事件
   */
  const _handleEnded = () => {
    state.isPaused = true

    config.value.endedCallback && config.value.endedCallback()
  }

  /**
   * @description: 监听播放进度
   */
  const _handleTimeUpdate = () => {
    state.currentTime = videoRef.value.currentTime // 获取当前秒数
    const ratio = (state.currentTime / state.duration).toFixed(4)
    // 进度条缩放
    videoControlRef.value.querySelector('.bar-progress').style.transform = `scaleX(${ratio})`

    // 移动进度点
    const dotLeft = progressBarW * ratio
    videoControlRef.value.querySelector('.bar-progress-dot').style.left = `${dotLeft}px`
  }

  /**
   * @description: 初始化播放器
   */
  const initPlayer = () => {
    volumeData.wrapRect = videoControlRef.value.querySelector('.volume-bar-wrap').getBoundingClientRect()
    _handleSetting()
    videoWrapRef.value.addEventListener('fullscreenchange', _handleScreen)
    videoRef.value.addEventListener('canplay', _handleCanPlay, false)
    videoRef.value.addEventListener('timeupdate', _handleTimeUpdate)
    videoRef.value.addEventListener('ended', _handleEnded)
    progressBarW = videoControlRef.value.querySelector('.ivideo-progress-bar').clientWidth // 获取进度条长度
  }

  /**
   * @description: 销毁播放器
   */
  const destroyPlayer = () => {
    videoWrapRef.value.removeEventListener('fullscreenchange', _handleScreen)
    videoRef.value.removeEventListener('canplay', _handleCanPlay)
    videoRef.value.removeEventListener('timeupdate', _handleTimeUpdate)
    videoRef.value.removeEventListener('ended', _handleEnded)
  }

  return {
    state,
    config,
    videoWrapRef,
    videoRef,
    videoControlRef,
    handleFocusProgress,
    handleBlurProgress,
    handlePlayAndPause,
    handleFullScreen,
    handleMuted,
    handleHoverVolume,
    handleBlurVolume,
    handleTouchStartVolume,
    handleTouchMoveVolume,
    handleTouchEndVolume,
    handleMousemoveVideo,
    handleMouseoutVideo,
    handleHoverSpeed,
    handleBlurSpeed,
    handleClickSpeedMenu,
    initPlayer,
    destroyPlayer
  }
}