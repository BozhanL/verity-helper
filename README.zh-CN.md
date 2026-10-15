# 真理助手

[English](README.md)

《命运 2》救赎边缘突袭第四关的外场剖切与单人房图形分配计算器，另提供外场剖切练习。
支持英文和简体中文。

## 使用工具

| 工具   | 英文                    | 简体中文            |
| ------ | ----------------------- | ------------------- |
| 计算器 | [Calculator][calc-en]   | [计算器][calc-zh]   |
| 单人房 | [Solo room][solo-en]    | [单人房][solo-zh]   |
| 练习   | [Exercise][exercise-en] | [练习][exercise-zh] |

[calc-en]: https://verity.903684.xyz/
[calc-zh]: https://verity.903684.xyz/zh/
[solo-en]: https://verity.903684.xyz/solo/
[solo-zh]: https://verity.903684.xyz/zh/solo/
[exercise-en]: https://verity.903684.xyz/exercise/
[exercise-zh]: https://verity.903684.xyz/zh/exercise/

通过顶部导航切换工具时会保留当前语言；切换语言时会保留当前工具。
三个工具都需要浏览器启用 JavaScript。

通过顶部的**主题**选择**浅色**、**深色**或**跟随系统**。
“跟随系统”会使用设备的外观设置。浏览器允许存储时，所选主题会被保存，并在切换工具或语言后保留。

工具布局适配手机和平板。图形和雕像选择支持触控、**Tab**、方向键和**空格键**。

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

## 单人房

1. 选择左侧和中间的**内场雕像**图形，右侧自动推算。
2. 在**你的雕像**中选择自己的位置。
3. 选择两个**房间图形**，查看**图形分配**。

每张卡片按位置和手持图形标明雕像。**送出**表示给该玩家的图形，**保留**表示留在自己房间的图形。
图形不会分配给自己，也不会分配给手持相同图形的玩家。

如果有两个自己的图形，各给另外两名玩家一个。
如果有两个相同的其他图形，给符合条件的另一名玩家一个，并保留一个。
两个不同的图形则直接分配给另外两名玩家。

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

项目使用 Astro、React、TypeScript 和 Tailwind CSS，通过 Remeda 处理数组辅助操作，并使用 Radix 构建无障碍选择控件。
安装 Node.js 24 和 npm 11（11.11 或更高版本），然后在本地仓库目录中运行：

```sh
npm ci
npm run dev
```

打开终端显示的地址，通常为 <http://localhost:4321>。
按 **Ctrl+C** 停止开发服务器。

检查包括类型、代码、格式检查，以及单元测试和浏览器测试。

| 命令                    | 用途                          |
| ----------------------- | ----------------------------- |
| `npm run check-all:par` | 并行运行全部检查和浏览器测试  |
| `npm run check-all`     | 顺序运行全部检查和浏览器测试  |
| `npm test`              | 运行单元测试与 React 交互测试 |
| `npm run test:e2e`      | 测试桌面和移动浏览器配置      |
| `npm run test:watch`    | 文件变化时重新运行测试        |
| `npm run format:fix`    | 格式化项目                    |
| `npm run build`         | 在 `dist/` 中生成静态站点     |
| `npm run preview`       | 在本地预览生产构建            |

运行 `npm run preview` 前，先运行 `npm run build`。

首次运行浏览器测试前，使用 `npx playwright install chromium firefox webkit` 安装浏览器引擎。
然后运行 `npm run test:e2e`，测试会自动构建并启动生产页面预览。
浏览器报告保存在 `playwright-report/`，截图和失败追踪保存在 `test-results/`。
在命令的环境中设置 `BASE_PATH=/review-preview` 即可测试子目录部署。CI 会运行这两种配置。

浏览器测试覆盖 Chromium、Firefox 和 WebKit 的桌面及移动配置。Firefox 的手机测试使用小尺寸视口和触控；Firefox 不支持完整的移动设备模拟。

提交 PR 前，运行 `npm run check-all:par`，并行执行全部检查和生产页面浏览器测试。使用 `npm run check-all` 可顺序执行相同的检查。
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
单人房测试覆盖雕像顺序、玩家位置和房间图形顺序的全部 162 种组合，包括重复图形与保留规则。
React 交互测试覆盖两种语言、主题偏好和键盘选择。
Playwright 在 Chromium、Firefox 和 WebKit 中检查激活交互后的生产页面，包括手机和平板的横竖屏布局、浅深主题，以及根路径和子目录导航。
生产部署会等待测试和生产构建均成功。

## 致谢

本项目由 OpenAI Codex 根据项目所有者的需求与反馈创建。

参考了以下工具：

- [yugnar 的 Verity Calculator](https://yugnar.com/verityCalculator/)。
  原计算器将剖切算法归功于
  [u/swegmesterflex](https://www.reddit.com/user/swegmesterflex/)。
- [终焉之形练习页面](https://static.19970301.xyz/the_final_shape/dist/index.html#/)。
- [Traveler’s Chosen 真理指南][solo-guide]，包含单人房直接分配规则。

[solo-guide]: https://sites.google.com/view/travelerschosen/guides/salvations-edge/verity

本项目独立实现求解器、组件及几何 SVG 图标。

项目采用 [AGPL-3.0](LICENSE) 许可证。
