<!--
 * @Author: kim
 * @Date: 2020-12-21 16:19:47
 * @LastEditors: kim
 * @LastEditTime: 2020-12-21 23:20:21
 * @Description: 瀑布流
-->
<template>
  <div class="wrap clearfix" ref="wrap">
    <div class="left" :style="{ width: `${imgWidth}px` }">
      <img
        class="img-box"
        :style="{
          height: `${data.imgHeights[index]}px`,
          marginBottom: `${vSpace}px`,
        }"
        v-for="index in data.leftImgIndexes"
        :src="imgUrl[index]"
        :key="index"
        alt=""
      />
    </div>
    <div class="right" :style="{ width: `${imgWidth}px` }">
      <img
        class="img-box"
        :style="{
          height: `${data.imgHeights[index]}px`,
          marginBottom: `${vSpace}px`,
        }"
        v-for="index in data.rightImgIndexes"
        :src="imgUrl[index]"
        :key="index"
        alt=""
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, toRaw } from 'vue'
export default {
  props: {
    imgUrl: {
      type: Array,
      default: () => [
        'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=2462593457,1389377076&fm=26&gp=0.jpg',
        'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=2683446143,1677008272&fm=26&gp=0.jpg',
        'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1591116485331&di=b0a6985c5aa3aec6ea963f1a06be0fc0&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201809%2F10%2F20180910230716_M4rLC.thumb.700_0.jpeg',
        'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=748733868,2760981387&fm=26&gp=0.jpg',
        'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1173833754,1745122581&fm=26&gp=0.jpg',
        'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1591116543993&di=7c8f7f2610c7c3fa678c903bd62e9b95&imgtype=0&src=http%3A%2F%2Fpic1.win4000.com%2Fwallpaper%2F7%2F5801cf985761a.jpg',
        'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=193000884,314632446&fm=26&gp=0.jpg',
        'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=1113492768,700410937&fm=26&gp=0.jpg',
        'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1773891623,1836257592&fm=26&gp=0.jpg',
        'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=1612516468,1620501003&fm=26&gp=0.jpg',
        'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=981722621,594097266&fm=15&gp=0.jpg',
        'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=253374817,3656489606&fm=11&gp=0.jpg',
        'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1941336264,1522874867&fm=26&gp=0.jpg',
      ],
    },
    // 垂直间距
    vSpace: {
      type: Number,
      default: 10,
    },
    // 水平间距
    hSpace: {
      type: Number,
      default: 0,
    },
  },
   setup(props) {
    const wrap = ref(null)
    let imgWidth = ref(0) // 图片宽度
    const data = reactive({
      leftImgIndexes: [],
      rightImgIndexes: [],
      imgHeights: []
    })

    /**
     * 计算所有图片缩放的高度
     * @param imgs 数组
     * @returns {Promise<unknown>}
     */
    function loadImgHeights(imgs) {
      return new Promise((resolve, reject) => {
        const length = imgs.length
        const heights = []
        let count = 0
        const checkIfFinished = () => {
          count++
          if (count === length) resolve(heights)
        }

        const load = (index) => {
          const img = new Image()
          img.onload = () => {
            const ratio = img.height / img.width // 求出比例
            const halfHeight = ratio * imgWidth.value
            heights[index] = halfHeight // 保存缩放后的高度
            checkIfFinished()
          }
          img.onerror = () => {
            heights[index] = 0
            checkIfFinished()
          }
          img.src = imgs[index] // 设置src
        }
        imgs.forEach((img, index) => load(index))
      })
    }
    // 分析
    // 其实就是将图片分为两组，即总图片高度的一半。然后在这一半的高度内放图片，求出放的图片高度之和最接近总高度一半的最优解
    function dpHalf(heights) {
      const sum = (arr) => {
        let sum = 0
        if (!arr.length) return sum
        return arr.reduce((count, height) => {
          return count + height
        })
      }
      let mid = Math.round(sum(heights) / 2) // 求出总高度一半
      let dp = []
      // 基础状态，只考虑第一张图片时候
      dp[0] = []
      for (let cap = 0; cap <= mid; cap++) {
        dp[0][cap] =
          heights[0] > cap
            ? { max: 0, indexes: [] }
            : { max: heights[0], indexes: [0] }
      }
      // 遍历每一张图片的高度，实质即遍历每一张图片
      for (
        let useHeightIndex = 1;
        useHeightIndex < heights.length;
        useHeightIndex++
      ) {
        // 先初始化为空数组
        if (!dp[useHeightIndex]) {
          dp[useHeightIndex] = []
        }
        for (let cap = 0; cap <= mid; cap++) {
          let usePrevHeightDp = dp[useHeightIndex - 1][cap]
          let usePrevHeightMax = usePrevHeightDp.max
          let currentHeight = heights[useHeightIndex] // 获取当前图片高度
          // 这里有个小坑 剩余高度一定要转化为整数 否则去dp数组里取到的就是undefined了
          let useThisHeightRestCap = Math.round(cap - heights[useHeightIndex])
          let useThisHeightPrevDp = dp[useHeightIndex - 1][useThisHeightRestCap]
          let useThisHeightMax = useThisHeightPrevDp
            ? currentHeight + useThisHeightPrevDp.max
            : 0
          // 是否把当前图片纳入选择 如果取当前的图片大于不取当前图片的高度
          if (useThisHeightMax > usePrevHeightMax) {
            dp[useHeightIndex][cap] = {
              max: useThisHeightMax,
              indexes: useThisHeightPrevDp.indexes.concat(useHeightIndex),
            }
          } else {
            dp[useHeightIndex][cap] = {
              max: usePrevHeightMax,
              indexes: usePrevHeightDp.indexes,
            }
          }
        }
      }
      return dp[heights.length - 1][mid]
    }

    function omitByIndexes(arr, omitIndexes) {
      let res = []
      for (let i = 0; i < arr.length; i++) {
        if (!omitIndexes.includes(i)) {
          res.push(i)
        }
      }
      return res
    }

    onMounted(async () => {
      const wrapWidth = wrap.value.clientWidth
      imgWidth.value = Math.floor((wrapWidth - props.hSpace) / 2)

      data.imgHeights = await loadImgHeights(props.imgUrl)
      data.leftImgIndexes = dpHalf(toRaw(data.imgHeights)).indexes
      data.rightImgIndexes = omitByIndexes(props.imgUrl, toRaw(data.leftImgIndexes))
    })

    return {
      wrap,
      imgWidth,
      data
    }
  },
}
</script>

<style scoped lang="scss">
.wrap {
  overflow: hidden;
  width: 100%;
}
.left {
  float: left;
  width: 170px;
}
.right {
  float: right;
  width: 170px;
}
.img-box {
  display: block;
  width: 100%;
}
</style>