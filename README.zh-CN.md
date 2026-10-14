# 真理助手

[English](README.md)

《命运 2》救赎边缘突袭第四关的外场剖切计算器与练习工具，支持英文和简体中文。

## 使用工具

| 工具   | 英文                    | 简体中文            |
| ------ | ----------------------- | ------------------- |
| 计算器 | [Calculator][calc-en]   | [计算器][calc-zh]   |
| 练习   | [Exercise][exercise-en] | [练习][exercise-zh] |

[calc-en]: https://verity.903684.xyz/
[calc-zh]: https://verity.903684.xyz/zh/
[exercise-en]: https://verity.903684.xyz/exercise/
[exercise-zh]: https://verity.903684.xyz/zh/exercise/

通过顶部导航切换工具时会保留当前语言；切换语言时会保留当前工具。
两个工具都需要浏览器启用 JavaScript。

## 计算器

1. 在**内场雕像**中选择左侧和中间的平面图形。
2. 在**外场立体图形**中选择左侧和中间的立体图形，两座雕像可以选择相同的图形。
3. 按**剖切步骤**中的数字顺序操作，每两次剖切完成一次交换。

右侧雕像会自动推算，计算器会给出交换次数最少的方案。
外场立体图形的组成必须恰好包含两个圆形、两个三角形和两个正方形。
组合无效或图形已经正确时，计算器会显示相应提示。

每次交换按左侧、中间、右侧的雕像顺序显示三个方框。
先从标记 **1** 的雕像剖切方框内的图形，再从标记 **2** 的雕像剖切对应图形。
每次交换下方显示交换后的房间，最后一步即完成后的房间。

## 练习

1. 点击**开始练习**，开始一轮 3 分 30 秒的随机练习。
2. 选择**当前图形**，再点击一座雕像下方的**剖切**。
3. 选择另一种图形，再点击另一座雕像下方的**剖切**，完成交换。

点击**取消选择**可清除待完成的剖切，点击**新练习**可重新开始。
目标是让每座外场雕像包含对应内场图形之外的另外两种图形。
练习只展示给定的内场图形和外场立体图形，方便你在没有解题提示的情况下练习。

完成后计时停止，超时后无法继续剖切。切换到其他标签页时，计时仍会继续。
切换工具或语言会重置本轮练习。

## 本地开发

项目使用 Astro、React、TypeScript 和 Tailwind CSS。
安装 Node.js 24 和 npm 11（11.11 或更高版本），然后在本地仓库目录中运行：

```sh
npm ci
npm run dev
```

打开终端显示的地址，通常为 <http://localhost:4321>。
按 **Ctrl+C** 停止开发服务器。

检查包括类型、代码、格式检查和测试。

| 命令                    | 用途                               |
| ----------------------- | ---------------------------------- |
| `npm run check-all:par` | 并行运行类型、代码、格式检查和测试 |
| `npm run check-all`     | 顺序运行上述检查                   |
| `npm test`              | 运行单元测试与 React 交互测试      |
| `npm run test:watch`    | 文件变化时重新运行测试             |
| `npm run format:fix`    | 格式化项目                         |
| `npm run build`         | 在 `dist/` 中生成静态站点          |
| `npm run preview`       | 在本地预览生产构建                 |

运行 `npm run preview` 前，先运行 `npm run build`。

提交 PR 前，运行 `npm run check-all:par`。
提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)。
提交钩子会自动检查信息格式；`npm run commit` 可打开交互提示，帮助你编写提交信息。

## 部署

部署到其他域名或子目录时，可以在构建环境中设置以下可选变量：

- `SITE_URL`：公开站点源地址，例如 `https://example.com`，用于规范链接和其他语言版本的链接。
- `BASE_PATH`：部署子目录，例如 `/verity-helper`，默认值为 `/`；导航和资源地址都会使用此路径。

本地开发无需设置这两个变量。GitHub 工作流会为正式部署和 PR 预览自动设置它们。

## 项目结构与测试

Astro 生成静态页面，React 负责交互控件。

| 位置                                | 内容                      |
| ----------------------------------- | ------------------------- |
| [pages/](src/pages/)                | Astro 页面路由            |
| [components/](src/components/)      | 页面内容与 React 交互工具 |
| [verity.ts](src/lib/verity.ts)      | 图形规则与求解器          |
| [practice.ts](src/lib/practice.ts)  | 练习回合与计时            |
| [messages.ts](src/i18n/messages.ts) | 英文和简体中文文本        |
| [global.css](src/styles/global.css) | 共享样式                  |

Vitest 覆盖全部 126 种有效房间配置、非法输入，以及取消、完成、重置和超时等练习行为。
React 交互测试覆盖两种语言。

## 致谢

本项目由 OpenAI Codex 根据项目所有者的需求与反馈创建。

参考了以下工具：

- [yugnar 的 Verity Calculator](https://yugnar.com/verityCalculator/)。
  原计算器将剖切算法归功于
  [u/swegmesterflex](https://www.reddit.com/user/swegmesterflex/)。
- [终焉之形练习页面](https://static.19970301.xyz/the_final_shape/dist/index.html#/)。

本项目独立实现求解器、组件及几何 SVG 图标。

项目采用 [AGPL-3.0](LICENSE) 许可证。
