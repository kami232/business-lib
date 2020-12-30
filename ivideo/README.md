# ivideo

小巧的 视频播放器（vue版）

## 配置 `options`

- `size: {object}` 设置视频窗口宽高。
  - `width: {number}` 视频窗口宽度，默认 512px。
  - `height: {number}` 视频窗口高度，默认 288px。
- `autoFit: {boolean}` 视频窗口是否自适应宽高，默认 `false`。注意：开启时 `width`、`height` 会失效。
- `autoplay: {boolean}` 视频自动播放，默认 `false` 。
- `muted: {boolean}` 静音，默认 `false`。
- `loop: {boolean}` 是否循环播放，默认 `false`。
- `preload: {string}`
- `speed: {object}` 视频速率配置。
  - `open: {boolean}` 是否显示速率按钮，默认 `true`。
  - `options: {Array}` 速率选择菜单。
    - `label: {string}` 菜单选项名。
    - `value: {number}` 菜单选项值。
  - `defaultValue: {number}` 默认选项。
- `playCallback: {function}` 视频播放暂停回调，同时会回传一个布尔值，`false`是播放中，`true`是暂停。
- `endedCallback: {function}` 视频播放完毕回调。
- `mutedCallback: {function}` 静音回调，同时会回传一个布尔值，`false`是静音，`true`是静音。



**默认配置项**👇

```javascript
{
    width: 512,
    height: 288,
    autoFit: false,
    autoplay: false,
    muted: false,
    loop: false,
    preload: 'metadata',
    speed: {
      open: true,
      options: [
        {
          label: '0.5x',
          value: 0.5
        },
        {
          label: '1.0x',
          value: 1
        },
        {
          label: '1.5x',
          value: 1.5
        },
        {
          label: '2.0x',
          value: 2
        }
      ],
      defaultValue: 1
    }
}
```

