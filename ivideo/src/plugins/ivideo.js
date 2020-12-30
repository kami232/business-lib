/*
 * @Author: kim
 * @Date: 2020-12-29 16:48:12
 * @LastEditors: kim
 * @LastEditTime: 2020-12-30 17:44:06
 * @Description: 自定义播放器逻辑文件
 */
import {
  reactive,
  ref,
  computed,
  watch
} from 'vue'
import {isEqual as _isEqual, isElement as _isElement, isFunction as _isFunction} from 'lodash'
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
  const state = reactive({
    duration: 0, //视频时长
    isPaused: true, // 是否处于暂停
    isMuted: false, // 是否静音
    isFullScreen: false, // 是否处于全屏状态
    controlVisiable: true, // 控制台是否显示
    speedMenuVisiable: false, // 速率菜单显隐
    dotVisiable: false, // 进度条拖拽点显隐
    speed: {}, // 当前的速率
  })
  let controlTimer = null // 控制台timer
  let speedTimer = null

  // 合并配置
  const config = computed(() =>
    Object.assign({}, defaultConfig, props)
  )

  // 监听配置的变化
  watch(config, (newValue, oldValue) => {
    const keys = Object.keys(newValue)

    keys.forEach(key => {
      // 如果是dom或函数不参与比较
      if(_isElement(newValue[key]) || _isFunction(newValue[key])) return

      if(_isEqual(newValue[key], oldValue[key])) {
        return
      }

      if(key === 'size' && newValue.autoFit) {
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
      if(typeof autoFit !== 'boolean') return

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
      if (obj.options.length) {
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

    if(config.value.autoFit) {
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
  const handleFocusProgress = (e) => {
    const progressWrap = videoWrapRef.value.querySelector(
      '.ivideo-progress-bar'
    )
    if (isNodeContain(progressWrap, e.relatedTarget)) return
    cssHelper(progressWrap, {
      transform: 'scale(1.01)',
    })
    state.dotVisiable = true
  }

  /**
   * @description: 进度条失去焦点
   * @param {Object} e
   */
  const handleBlurProgress = (e) => {
    const progressWrap = videoWrapRef.value.querySelector(
      '.ivideo-progress-bar'
    )
    if (isNodeContain(progressWrap, e.relatedTarget)) return
    cssHelper(progressWrap, {
      transform: 'scale(1)',
    })
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
    state.controlVisiable = true
    clearTimeout(controlTimer)
    const parentNode = videoWrapRef.value.querySelector(
      '.ivideo-control-wrap'
    )
    if (isNodeContain(parentNode, e.target)) return
    controlTimer = setTimeout(() => {
      state.controlVisiable = false
    }, 1000)
  }

  /**
   * @description: 鼠标移出事件
   * @param {Object} e 事件参数
   */
  const handleMouseoutVideo = e => {
    clearTimeout(controlTimer)
    if (isNodeContain(videoWrapRef.value, e.relatedTarget)) return
    controlTimer = setTimeout(() => {
      state.controlVisiable = false
    }, 1000)
  }

  /**
   * @description: 倍率移入
   */
  const handleHoverSpeed = () => {
    clearTimeout(speedTimer)
    state.speedMenuVisiable = true
  }

  /**
   * @description: 倍率移出
   */
  const handleBlurSpeed = e => {
    clearTimeout(speedTimer)
    if (isNodeContain(e.target, e.relatedTarget)) return
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
  }

  /**
   * @description: 监听播放完成事件
   */
  const _handleEnded = () => {
    state.isPaused = true

    config.value.endedCallback && config.value.endedCallback()
  }

  const _handleTimeUpdate = () => {
    console.log(videoRef.value.currentTime);
  }

  /**
   * @description: 初始化播放器
   */
  const initPlayer = () => {
    _handleSetting()
    videoWrapRef.value.addEventListener('fullscreenchange', _handleScreen)
    videoRef.value.addEventListener('canplay', _handleCanPlay, false)
    videoRef.value.addEventListener('timeupdate', _handleTimeUpdate)
    videoRef.value.addEventListener('ended', _handleEnded)
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
    handleFocusProgress,
    handleBlurProgress,
    handlePlayAndPause,
    handleFullScreen,
    handleMuted,
    handleMousemoveVideo,
    handleMouseoutVideo,
    handleHoverSpeed,
    handleBlurSpeed,
    handleClickSpeedMenu,
    initPlayer,
    destroyPlayer
  }
}