<template>
  <div class="ivideo" ref="videoWrapRef">
    <video class="ivideo-player" ref="videoRef">
      <source
        src="https://huohucloud.9ishouyou.com/video/sp1.mp4"
        type="video/mp4"
      />
    </video>
    <div class="ivideo-control-wrap">
      <div class="ivideo-control-top">
        <div
          class="ivideo-progress-bar"
          @mouseover="handleFocusProgress"
          @mouseout="handleBlurProgress"
        >
          <div class="bar-buffer"></div>
          <div class="bar-progress">
            <transition name="fade">
              <div class="bar-progress-dot" v-show="dotVisiable"></div>
            </transition>
          </div>
        </div>
      </div>
      <div class="ivideo-control-bottom">
        <div class="ivideo-control-b-left">
          <div class="ivideo-control-btn">
            <span class="ivideo-control-svg">
              <!-- 播放和暂停 -->
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="#fff"
              >
                <g>
                  <path
                    d="M852.727563 392.447107C956.997809 458.473635 956.941389 565.559517 852.727563 631.55032L281.888889 993.019655C177.618644 1059.046186 93.090909 1016.054114 93.090909 897.137364L93.090909 126.860063C93.090909 7.879206 177.675064-35.013033 281.888889 30.977769L852.727563 392.447107 852.727563 392.447107Z"
                  ></path>
                </g>
                <g v-if="false">
                  <path
                    d="M309.3 130.7h-70.9c-24.3 0-44 19.7-44 44v674.5c0 24.3 19.7 44 44 44h70.9c24.3 0 44-19.7 44-44V174.7c0-24.3-19.7-44-44-44z m476.3 0h-70.9c-24.3 0-44 19.7-44 44v674.5c0 24.3 19.7 44 44 44h70.9c24.3 0 44-19.7 44-44V174.7c0-24.3-19.7-44-44-44z"
                  ></path>
                </g>
              </svg>
            </span>
          </div>

          <div class="ivideo-control-duration">00:00 / 11:00</div>
        </div>

        <div class="ivideo-control-b-right">
          <div class="ivideo-control-btn ivideo-control-btn-quality">
            <button class="ivideo-control-quality-name">1080p</button>
          </div>

          <div class="ivideo-control-btn ivideo-control-btn-speed">
            <button class="ivideo-control-speed-name">1.0 x</button>
          </div>

          <div class="ivideo-control-btn">
            <span class="ivideo-control-svg">
              <!-- 音量 -->
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="#fff"
              >
                <g>
                  <path
                    d="M779.946667 357.12a42.666667 42.666667 0 1 0-66.56 53.76 170.666667 170.666667 0 0 1 0 202.24A42.666667 42.666667 0 0 0 746.666667 682.666667a42.666667 42.666667 0 0 0 33.28-15.786667 256 256 0 0 0 0-309.76z"
                  ></path>
                  <path
                    d="M837.973333 223.146667a42.666667 42.666667 0 1 0-54.613333 65.706666A290.133333 290.133333 0 0 1 896 512a290.133333 290.133333 0 0 1-112.64 223.146667 42.666667 42.666667 0 0 0-5.546667 60.16A42.666667 42.666667 0 0 0 810.666667 810.666667a42.666667 42.666667 0 0 0 27.306666-9.813334A373.333333 373.333333 0 0 0 981.333333 512a373.333333 373.333333 0 0 0-143.36-288.853333zM617.386667 133.12a42.666667 42.666667 0 0 0-42.666667 0L298.666667 322.986667H85.333333a42.666667 42.666667 0 0 0-42.666666 42.666666v292.693334a42.666667 42.666667 0 0 0 42.666666 42.666666h213.333334l273.493333 187.733334A45.226667 45.226667 0 0 0 597.333333 896a42.666667 42.666667 0 0 0 42.666667-42.666667V170.666667a42.666667 42.666667 0 0 0-22.613333-37.546667z"
                  ></path>
                </g>

                <g v-if="false">
                  <path
                    d="M721.493333 600.746667l61.44 61.44a256 256 0 0 0-2.986666-305.066667 42.666667 42.666667 0 1 0-66.56 53.76 170.666667 170.666667 0 0 1 8.106666 189.866667z"
                  ></path>
                  <path
                    d="M896 512a277.76 277.76 0 0 1-75.946667 187.306667l60.586667 60.586666A363.946667 363.946667 0 0 0 981.333333 512a373.333333 373.333333 0 0 0-143.36-288.853333 42.666667 42.666667 0 1 0-54.613333 65.706666A290.133333 290.133333 0 0 1 896 512zM640 519.253333V170.666667a42.666667 42.666667 0 0 0-66.986667-35.413334L384 264.533333zM202.24 322.986667H85.333333a42.666667 42.666667 0 0 0-42.666666 42.666666v292.693334a42.666667 42.666667 0 0 0 42.666666 42.666666h213.333334l273.493333 187.733334A45.226667 45.226667 0 0 0 597.333333 896a42.666667 42.666667 0 0 0 42.666667-42.666667v-92.586666zM200.96 140.373333a42.666667 42.666667 0 0 0-60.586667 60.586667l682.666667 682.666667a42.666667 42.666667 0 0 0 60.586667 0 42.666667 42.666667 0 0 0 0-60.586667z"
                  ></path>
                </g>
              </svg>
            </span>
          </div>

          <div class="ivideo-control-btn">
            <span class="ivideo-control-svg">
              <!-- 全屏 -->
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="#fff"
              >
                <g>
                  <path
                    d="M146.070588 12.890353c-66.258824 0-126.494118 55.958588-126.494117 124.988235v124.988236c0 27.587765 24.094118 49.995294 54.211764 49.995294 24.094118 0 48.188235-22.407529 48.188236-49.995294V137.878588c0-13.793882 12.047059-24.997647 24.094117-24.997647h126.494118c24.094118 0 48.188235-22.407529 48.188235-49.995294 0-27.648-24.094118-49.995294-48.188235-49.995294h-126.494118z m752.941177 0c66.258824 0 120.470588 55.958588 120.470588 124.988235v124.988236c0 27.587765-18.070588 49.995294-48.188235 49.995294s-48.188235-22.407529-48.188236-49.995294V137.878588c0-13.793882-12.047059-24.997647-24.094117-24.997647h-126.494118c-30.117647 0-54.211765-22.407529-54.211765-49.995294 0-27.648 24.094118-49.995294 54.211765-49.995294h126.494118zM19.576471 887.808c0 69.029647 60.235294 124.988235 126.494117 124.988235h126.494118c24.094118 0 48.188235-22.347294 48.188235-49.995294 0-27.587765-24.094118-49.995294-48.188235-49.995294h-126.494118c-12.047059 0-24.094118-11.203765-24.094117-24.997647v-124.988235c0-27.587765-24.094118-49.995294-48.188236-49.995294-30.117647 0-54.211765 22.407529-54.211764 49.995294v124.988235z m879.435294 124.988235c66.258824 0 120.470588-55.958588 120.470588-124.988235v-124.988235c0-27.587765-18.070588-49.995294-48.188235-49.995294s-48.188235 22.407529-48.188236 49.995294v124.988235c0 13.793882-12.047059 24.997647-24.094117 24.997647h-126.494118c-30.117647 0-54.211765 22.407529-54.211765 49.995294 0 27.648 24.094118 49.995294 54.211765 49.995294h126.494118z"
                  ></path>
                </g>
                <g v-if="false">
                  <path
                    d="M200.282353 312.862118c66.258824 0 120.470588-55.958588 120.470588-124.988236V62.885647c0-27.648-18.070588-49.995294-48.188235-49.995294-24.094118 0-48.188235 22.347294-48.188235 49.995294v124.988235c0 13.793882-12.047059 24.997647-24.094118 24.997647h-126.494118c-30.117647 0-48.188235 22.347294-48.188235 49.995295 0 27.587765 18.070588 49.995294 48.188235 49.995294h126.494118z m650.541176 0c-72.282353 0-126.494118-55.958588-126.494117-124.988236V62.885647c0-27.648 24.094118-49.995294 48.188235-49.995294 30.117647 0 48.188235 22.347294 48.188235 49.995294v124.988235c0 13.793882 12.047059 24.997647 30.117647 24.997647h120.470589c30.117647 0 54.211765 22.347294 54.211764 49.995295 0 27.587765-24.094118 49.995294-54.211764 49.995294h-120.470589z m-530.070588 524.950588c0-69.029647-54.211765-124.988235-120.470588-124.988235h-126.494118c-30.117647 0-48.188235 22.407529-48.188235 49.995294 0 27.648 18.070588 49.995294 48.188235 49.995294h126.494118c12.047059 0 24.094118 11.203765 24.094118 24.997647v124.988235c0 27.648 24.094118 49.995294 48.188235 49.995294 30.117647 0 48.188235-22.347294 48.188235-49.995294v-124.988235z m530.070588-124.988235c-72.282353 0-126.494118 55.958588-126.494117 124.988235v124.988235c0 27.648 24.094118 49.995294 48.188235 49.995294 30.117647 0 48.188235-22.347294 48.188235-49.995294v-124.988235c0-13.793882 12.047059-24.997647 30.117647-24.997647h120.470589c30.117647 0 54.211765-22.347294 54.211764-49.995294 0-27.587765-24.094118-49.995294-54.211764-49.995294h-120.470589z"
                  ></path>
                </g>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, reactive, ref } from 'vue'
import { defaultConfig, cssHelper } from './ivideo.js'

export default {
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const videoWrapRef = ref(null)
    const videoRef = ref(null)
    const dotVisiable = ref(false)

    // 合并配置
    const config = reactive(Object.assign({}, defaultConfig, props.options))
    /**
     * @description: 基础设置
     * @param {*}
     * @return {*}
     */
    const _handleSetting = () => {
      const styleObj = {
        width: `${config.width}px`,
        height: `${config.height}px`,
      }

      // 是否自适应父容器
      if (config.autoFit) {
        styleObj.width = '100%'
        styleObj.height = '100%'
      }

      cssHelper(videoWrapRef.value, styleObj)
    }

    /**
     * @description: 进度条焦点
     * @param {*}
     * @return {*}
     */
    const handleFocusProgress = () => {
      console.log('111111')
      dotVisiable.value = true
    }

    /**
     * @description: 进度条失去焦点
     * @param {*}
     * @return {*}
     */
    const handleBlurProgress = () => {
      dotVisiable.value = false
    }

    onMounted(() => {
      _handleSetting()
    })

    return {
      videoWrapRef,
      videoRef,
      dotVisiable,
      handleFocusProgress,
      handleBlurProgress,
      config,
    }
  },
}
</script>

<style scoped lang="scss">
.ivideo {
  position: relative;
  user-select: none;
}

.ivideo-player {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  background-color: #000;
}

.ivideo-control-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.1);

  .ivideo-control-top {
    overflow: hidden;
    padding: 4px 10px;
    width: 100%;

    .ivideo-progress-bar {
      position: relative;
      height: 4px;
      background-origin: content-box;
      background-clip: content-box;
      background-color: rgba(255, 255, 255, 0.2);
      cursor: pointer;
    }

    .bar-buffer {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 50%;
      transform-origin: 0 0;
      background-color: rgba(255, 255, 255, 0.3);
    }

    .bar-progress {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 30%;
      transform-origin: 0 0;
      background-color: #7d72b6;

      .bar-progress-dot {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translate(50%, -50%);
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #7d72b6;
      }
    }
  }

  .ivideo-control-bottom {
    display: flex;
    align-items: center;
    padding: 6px 10px 10px;
    font-size: 0;

    .ivideo-control-b-left {
      display: flex;
      align-items: center;
      flex-shrink: 0;

      .ivideo-control-duration {
        margin-left: 10px;
        font-size: 12px;
        color: #fff;
      }
    }

    .ivideo-control-b-right {
      display: flex;
      flex-grow: 1;
      justify-content: flex-end;
      -webkit-box-pack: end;
    }

    .ivideo-control-btn {
      flex-shrink: 0;
      width: auto;
      height: 22px;
      font-size: 12px;
      line-height: 22px;
      color: #fff;
      cursor: pointer;

      &.ivideo-control-btn-speed,
      &.ivideo-control-btn-quality {
        padding: 0 10px;

        .ivideo-control-speed-name,
        .ivideo-control-quality-name {
          width: 100%;
          border: none;
          color: inherit;
          font-size: inherit;
          line-height: inherit;
          outline: none;
          background: none;
        }
      }
    }

    .ivideo-control-svg {
      display: inline-block;
      padding: 0 8px;
      height: 22px;
    }
  }

  .fade-enter-active {
    animation: fade-in 0.5s;
  }
  .fade-leave-active {
    animation: fade-out 0.5s;
  }

  @keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes fade-out {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
}
</style>