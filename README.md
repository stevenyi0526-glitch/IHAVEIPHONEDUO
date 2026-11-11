# IHAVEIPHONEDUO

我也有 iPhone Duo：上传任意图片，一键变成 iPhone Duo 外屏截图的样子，自带右侧黑边。

在线使用：https://stevenyi0526-glitch.github.io/IHAVEIPHONEDUO/

iPhone Duo 的外屏截图会带上右侧的黑色状态栏，去不掉，再截一次还会“套娃”。外屏又短又宽，这种截图发到普通手机上全屏查看时，上下还会多出一大片黑色。既然去不掉，不如人人都有一条。

<img src="docs/example.png" alt="效果示例：图片变成贴左、右侧圆角的窗口，右侧是带时间和电量的黑边" width="320">

## 使用方法

1. 点击「上传图片」，选择一张图片。
2. 查看生成的效果。
3. 点击「保存图片」，得到一张 1398×2034 的 PNG。

把生成的图片再上传一次，就能得到“套娃”效果。

图片只在浏览器本地处理，不会上传到任何服务器。网页用 [GoatCounter](https://www.goatcounter.com/) 匿名统计访问量和上传、保存次数，不使用 Cookie，也不收集图片。

## 效果说明

- 输出尺寸是外屏的官方分辨率 1398×2034。
- 图片铺满左侧窗口，比例不同时会居中裁剪，上下不留黑边。
- 右侧状态栏里的时间是当前时间，电量（88）是固定的。
- 布局参考 Apple 官方的外屏设计图和真实截图，不同 App 或状态下可能略有差异。

## 本地运行

需要 Node.js 20.19+ 或 22.12+。

```bash
./start.sh
```

脚本会在首次运行时安装依赖，然后启动开发服务器。

构建生产版本：

```bash
npm run build
```

构建会生成根目录的 `index.html`，它是一个包含全部代码的单文件网页，由 GitHub Pages 直接托管。

修改网页时请改 `src/` 里的文件，然后重新构建并提交，不要直接改根目录的 `index.html`。

## 技术栈

Vite + React，图片用 Canvas 绘制，核心逻辑在 [`src/duoFrame.js`](src/duoFrame.js)。

## 声明

这是一个玩梗的个人项目，与 Apple 没有任何关联。iPhone 是 Apple Inc. 的商标。
