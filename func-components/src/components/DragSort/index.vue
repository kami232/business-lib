<!--
 * @Author: kim
 * @Date: 2020-12-22 10:07:14
 * @LastEditors: kim
 * @LastEditTime: 2020-12-24 17:40:07
 * @Description: 拖拽排序图片
-->
<template>
  <div
    class="drag-wrap"
    ref="dragWrapRef"
    @dragend="handleDragEnd"
    @dragover="handleDragOver"
  >
    <ul class="drag-list" :style="{ height: `${drapWrapHeight}px` }">
      <li
        class="item"
        v-for="(item, index) in dragList"
        :key="item.id"
        :style="{
          width: `${imgSize}px`,
          height: `${imgSize}px`,
          left: `${imgLeft(index)}px`,
          top: `${imgTop(index)}px`,
        }"
        @dragstart="(e) => handleDragStart(e, item)"
        draggable="true"
      >
        <img :src="item.imgUrl" alt="" draggable="false" />
      </li>
    </ul>
  </div>
</template>

<script>
import {
  onMounted,
  reactive,
  ref,
  toRefs,
  toRef,
  computed,
  onUnmounted,
  toRaw,
} from 'vue'
export default {
  props: {
    column: {
      type: Number,
      default: 4,
    },
    dataSource: {
      type: Array,
      default: [
        {
          id: 1,
          name: 'one',
          imgUrl:
            'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=4008842364,2792264191&fm=26&gp=0.jpg',
        },
        {
          id: 2,
          name: 'two',
          imgUrl:
            'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1961155531,4083413222&fm=26&gp=0.jpg',
        },
        {
          id: 3,
          name: 'three',
          imgUrl:
            'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=1127316522,293083506&fm=26&gp=0.jpg',
        },
        {
          id: 4,
          name: 'four',
          imgUrl:
            'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=3423787266,1419039532&fm=26&gp=0.jpg',
        },
        {
          id: 5,
          name: 'five',
          imgUrl:
            'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3771115016,2161480362&fm=26&gp=0.jpg',
        },
      ],
    },
  },
  setup(props) {
    const { column } = toRefs(props)

    const state = reactive({
      dragList: props.dataSource,
    })

    const IMAGE_PADDING = 10
    const dragWrapRef = ref(null) // 父容器对象
    let dragItemRef = null // 拖拽对象
    let dragItemData = null // 拖拽对象数据
    const drapWrapHeight = ref(0) // 父容器高度
    const imgSize = ref(0) // 图片宽高

    // 重新计算尺寸
    const handleResize = () => {
      const wrapW = dragWrapRef.value.clientWidth // 获取宽度
      imgSize.value =
        (wrapW - (column.value - 1) * IMAGE_PADDING) / column.value // 计算图片的宽高
      const row = Math.ceil(state.dragList.length / column.value) // 计算出多少行
      drapWrapHeight.value = row * imgSize.value + (row - 1) * IMAGE_PADDING // 计算容器的高度
    }

    // 设置屏幕监听
    window.addEventListener('resize', handleResize)

    // 计算图片left值
    const imgLeft = computed(() => {
      return (index) => {
        return (index % column.value) * (imgSize.value + IMAGE_PADDING)
      }
    })
    // 计算图片top值
    const imgTop = computed(() => {
      return (index) => {
        const row = Math.floor(index / column.value)
        return row * imgSize.value + row * IMAGE_PADDING
      }
    })

    onMounted(() => {
      handleResize()
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    /**
     * @description: 从from插入到to位置，返回改变后的数组
     * @param {Array} list 数组
     * @param {Object} fromData 拖拽对象数据
     * @param {number} from 移动前的index
     * @param {number} to 目标index
     * @return {Array}
     */
    const insertBefore = (list, fromData, from, to) => {
      if (from === to) return list
      const newList = [...list]
      newList.splice(from, 1)
      newList.splice(to, 0, fromData)
      return newList
    }

    /**
     * @description: 更新列表
     * @param {number} x 横坐标
     * @param {number} y 纵坐标
     * @return {void}
     */
    const updateDragList = (x, y) => {
      if (!dragWrapRef.value || !dragItemRef || !dragItemData) return

      const dropRect = dragWrapRef.value.getBoundingClientRect()
      if (!dropRect) return
      // 求出鼠标相对父容器的位置
      const offsetX = x - dropRect.left
      const offsetY = y - dropRect.top

      // 表示超出容器
      if (
        offsetX < 0 ||
        offsetX > dropRect.width ||
        offsetY < 0 ||
        offsetY > dropRect.height
      )
        return

      // 计算出移动到第几行第几列
      const col = Math.floor(offsetX / imgSize.value) // 列
      const row = Math.floor(offsetY / imgSize.value) // 行
      let currentIndex = row * column.value + col // 目标位置后一个index
      currentIndex =
        currentIndex > state.dragList.length - 1
          ? state.dragList.length - 1
          : currentIndex

      const fromIndex = state.dragList.indexOf(dragItemData) // 拖拽元素的index

      const newList = insertBefore(
        toRaw(state.dragList),
        dragItemData,
        fromIndex,
        currentIndex
      ) // 重新排序后的数组

      state.dragList = newList
    }

    // 拖动开始
    const handleDragStart = (e, item) => {
      e.target && e.target.classList.add('dragging')
      dragItemRef = e.target
      dragItemData = toRaw(item)
    }

    // 拖动结束
    const handleDragEnd = () => {
      if (dragItemRef) {
        dragItemRef.classList.remove('dragging')
      }
      dragItemRef = null
      dragItemData = null
    }

    // 拖动到可释放目标上触发
    const handleDragOver = (e) => {
      e.preventDefault()
      updateDragList(e.clientX, e.clientY)
    }

    return {
      dragList: toRef(state, 'dragList'),
      dragWrapRef,
      imgSize,
      drapWrapHeight,
      imgLeft,
      imgTop,
      handleDragStart,
      handleDragEnd,
      handleDragOver,
    }
  },
}
</script>

<style lang="scss" scoped>
.drag-wrap {
  margin: 10px;

  .drag-list {
    position: relative;
    width: 100%;

    .item {
      overflow: hidden;
      position: absolute;
      display: flex;
      align-items: center;
      border-radius: 10px;
      box-shadow: 0 0 10px #ccc;
      background-color: #eee;
      transition: all 200ms ease-in-out;

      img {
        display: block;
        width: 100%;
      }

      &.dragging {
        transform: scale(1.04);
        opacity: 0.7;
      }
    }
  }
}
</style>>