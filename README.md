# 业务库（）

仅用于本人参考。
用来保存以往实现的某个功能的源码，以及一些手写实现某一功能的原理源码。

## 目录解析

|     文件夹     |        描述         |
| :------------: | :-----------------: |
| bigfile-upload |   大文件分片上传    |
| bright-watermark | 明水印 |
| blind-watermark | 盲水印 |
|      mvvm      |   响应式原理实现    |
|    mvvm2.0     | 响应式原理（proxy） |
|   my-router    |     vue路由显示     |
|   myPromise    |   promise原理实现   |
|   floatBall    |       悬浮球        |
| func-components |   功能组件    |
| shared |   工具类    |

### `func-components`

- DragSort 拖拽排序
- WaterFall 瀑布流

### shared

- `utils` 工具类
  - `getURLParameters` 获取 url 参数
  - `copyToClipboard` 复制文本
  - `debounce` 防抖
  - `throttle` 节流
- `shtorage` localStorage & sessionStorage 封装
- `observer` 发布订阅
