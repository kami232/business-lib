/*
 * @Author: kim
 * @Date: 2020-12-29 16:48:12
 * @LastEditors: kim
 * @LastEditTime: 2020-12-29 17:08:05
 * @Description: 自定义播放器逻辑文件
 */
import {
  reactive,
  ref,
  computed,
} from 'vue'
import {
  cssHelper,
  toFullVideo,
  exitFullscreen,
  isNodeContain,
} from '@/assets/js/utils.js'


export default function (props) {
  const videoWrapRef = ref(null) // 父容器引用
  const videoRef = ref(null) // video 引用
  const dotVisiable = ref(false) // 进度条拖拽点显隐
  const state = reactive({
    duration: 0, //视频时长
    isPaused: true, // 是否处于暂停
    isMuted: false, // 是否静音
    isFullScreen: false, // 是否处于全屏状态
    showControl: true, // 控制台是否显示
  })
  let controlTimer = null // 控制台timer

  /**
   * @description: 默认配置
   * 回调函数： playCallback: (status) => {} 暂停开始回调 false是播放中 true是暂停
   */
  const defaultConfig = {
    width: 512,
    height: 288,
    autoFit: false,
    autoplay: false, // 如果为true,浏览器准备好时开始回放
    muted: false, // 默认情况下将会消除任何音频
    loop: false,
    preload: 'metadata'
  }

  // 合并配置
  const config = computed(() =>
    Object.assign({}, defaultConfig, props.options)
  )

  /**
   * @description: 基础设置
   * @param {*}
   * @return {*}
   */
  const _handleSetting = () => {
    const styleObj = {
      width: `${config.value.width}px`,
      height: `${config.value.height}px`,
    }

    // 是否自适应父容器
    if (config.value.autoFit) {
      styleObj.width = '100%'
      styleObj.height = '100%'
    }

    cssHelper(videoWrapRef.value, styleObj)

    // 自动播放
    videoRef.value.autoplay = config.value.autoplay
    config.value.autoplay && (state.isPaused = false)
    // 静音
    videoRef.value.muted = config.value.muted
    config.value.muted && (state.isMuted = true)
    videoRef.value.loop = config.value.loop
    videoRef.value.preload = config.value.preload
    videoRef.value.controls = false
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
    dotVisiable.value = true
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
    dotVisiable.value = false
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

    videoRef.value.muted = !isMuted
    state.isMuted = !isMuted
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
  const handleMousemoveVideo = (e) => {
    state.showControl = true
    clearTimeout(controlTimer)
    const parentNode = videoWrapRef.value.querySelector(
      '.ivideo-control-wrap'
    )
    if (isNodeContain(parentNode, e.target)) return
    controlTimer = setTimeout(() => {
      state.showControl = false
    }, 1000)
  }

  /**
   * @description: 鼠标移出事件
   * @param {Object} e 事件参数
   */
  const handleMouseoutVideo = (e) => {
    clearTimeout(controlTimer)
    if (isNodeContain(videoWrapRef.value, e.relatedTarget)) return
    controlTimer = setTimeout(() => {
      state.showControl = false
    }, 1000)
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
    state.isFullScreen =
      document.fullscreenElement == videoWrapRef.value ? true : false
  }

  /**
   * @description: 监听播放完成事件
   */
  const _handleEnded = () => {
    state.isPaused = true
  }

  /**
   * @description: 初始化播放器
   */
  const initPlayer = () => {
    _handleSetting()
    videoWrapRef.value.addEventListener('fullscreenchange', _handleScreen)
    videoRef.value.addEventListener('canplay', _handleCanPlay, false)
    videoRef.value.addEventListener('ended', _handleEnded)
  }

  /**
   * @description: 销毁播放器
   */
  const destroyPlayer = () => {
    videoWrapRef.value.removeEventListener('fullscreenchange', _handleScreen)
    videoRef.value.removeEventListener('canplay', _handleCanPlay)
    videoRef.value.removeEventListener('ended', _handleEnded)
  }

  return {
    state,
    videoWrapRef,
    videoRef,
    dotVisiable,
    handleFocusProgress,
    handleBlurProgress,
    handlePlayAndPause,
    handleFullScreen,
    handleMuted,
    handleMousemoveVideo,
    handleMouseoutVideo,
    initPlayer,
    destroyPlayer
  }
}