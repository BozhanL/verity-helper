# 救赎边缘助手

[English](README.md)

《命运 2》救赎边缘突袭第三关与第四关的辅助工具。
第三关提供终点板与共振指引；第四关提供外场剖切计算器、单人房图形分配计算器和练习。
支持英文和简体中文。

## 使用工具

| 页面           | 英文                        | 简体中文              |
| -------------- | --------------------------- | --------------------- |
| 关卡选择       | [Home][home-en]             | [首页][home-zh]       |
| 第三关：贮藏库 | [End-plate helper][repo-en] | [终点板助手][repo-zh] |
| 真理：剖切     | [Dissection][calc-en]       | [剖切][calc-zh]       |
| 真理：单人房   | [Solo room][solo-en]        | [单人房][solo-zh]     |
| 真理：练习     | [Exercise][exercise-en]     | [练习][exercise-zh]   |

[home-en]: https://verity.903684.xyz/
[home-zh]: https://verity.903684.xyz/zh/
[repo-en]: https://verity.903684.xyz/repository/
[repo-zh]: https://verity.903684.xyz/zh/repository/
[calc-en]: https://verity.903684.xyz/verity/
[calc-zh]: https://verity.903684.xyz/zh/verity/
[solo-en]: https://verity.903684.xyz/verity/solo/
[solo-zh]: https://verity.903684.xyz/zh/verity/solo/
[exercise-en]: https://verity.903684.xyz/verity/exercise/
[exercise-zh]: https://verity.903684.xyz/zh/verity/exercise/

通过顶部导航切换工具时会保留当前语言；切换语言时会保留当前工具。
剖切、单人房和练习均归属真理；交互工具需要浏览器启用 JavaScript。

通过顶部的**主题**选择**浅色**、**深色**或**跟随系统**。
“跟随系统”会使用设备的外观设置。浏览器允许存储时，所选主题会被保存，并在切换工具或语言后保留。

工具布局适配手机和平板。图形和雕像选择支持触控、**Tab**、方向键和**空格键**。

可以在电脑上使用**练习**学习剖切，并在开打前试用计算器。
同一套界面也适用于战斗时使用手机：触控区域更大，图示更紧凑，并显示**控件已就绪**状态。
无需另外设置学习模式或战斗模式。

## 第三关：贮藏库

1. 选择**分配的起点板**，再选择**房间 / 阶段**（1、2 或 3）。
   按**接收脉冲**的指引前往终点板，并请对应起点板的玩家发送脉冲。
2. 按终点板位置输入任意两个**导体报点**，第三个共振会自动推算。
   重复类型不可选择；点击**清除**后可改为输入其他导体。
3. 选择**你当前的共振**：圆形 / 球形、三角形 / 金字塔或正方形 / 六面体。
   最后拾取的共振决定当前类型。
4. 按**关闭导体**的指引前往目标终点板，并请与该终点相连的起点玩家发送脉冲。
   显示**留在**时，表示接收脉冲的终点板就是关闭导体的位置。

左、中、右均以站在入口面向出口时的方向为准，连线如下：

| 房间 | 左侧起点 → 终点 | 中间起点 → 终点 | 右侧起点 → 终点 |
| ---- | --------------- | --------------- | --------------- |
| 1    | 左侧            | 中间            | 右侧            |
| 2    | 中间            | 左侧            | 右侧            |
| 3    | 中间            | 右侧            | 左侧            |

切换房间会保留起点板，并清除导体报点和当前共振；在同一房间内更换起点板会保留这些输入。
点击**重置**会清除全部选择。切换页面或语言也会重置助手。

手机上的导体始终按左、中、右排列。控件显示简短的图形名称，展开**共振名称**可查看完整的游戏名称。
当前共振和关闭指引紧接导体报点，便于同时查看目标终点板和对应的起点玩家。

## 第四关：真理计算器

1. 在**内场雕像**中选择左侧和中间的平面图形。
2. 在**外场立体图形**中选择左侧和中间的立体图形，两座雕像可以选择相同的图形。
3. 按**剖切步骤**中的数字顺序操作，每两次剖切完成一次交换。

右侧雕像会自动推算，计算器会给出交换次数最少的方案。
外场立体图形的组成必须恰好包含两个圆形、两个三角形和两个正方形。
组合无效或图形已经正确时，计算器会显示相应提示。

每次交换按左侧、中间、右侧的雕像顺序显示三个方框。
先从标记 **1** 的雕像剖切方框内的图形，再从标记 **2** 的雕像剖切对应图形。
每次交换下方显示交换后的房间，最后一步即完成后的房间。

输入图形后，点击**查看结果**跳转到步骤；点击**修改输入**返回，已选内容会保留。
组合无效时，提示会说明需要核对的输入。修改输入后结果会立即更新，只有点击跳转链接时页面才会滚动。

### 单人房

1. 选择左侧和中间的**内场雕像**图形，右侧自动推算。
2. 在**你的雕像**中选择自己的位置。
3. 选择两个**房间图形**，查看**图形分配**。

每张卡片按位置和手持图形标明雕像。**送出**表示给该玩家的图形，**保留**表示留在自己房间的图形。
图形不会分配给自己，也不会分配给手持相同图形的玩家。

没有对应操作时，会明确显示**无需送出图形**或**无需保留图形**。
这里同样提供**查看结果**和**修改输入**链接。

如果有两个自己的图形，各给另外两名玩家一个。
如果有两个相同的其他图形，给符合条件的另一名玩家一个，并保留一个。
两个不同的图形则直接分配给另外两名玩家。

### 练习

1. 点击**开始练习**，开始一轮 3 分 30 秒的随机练习。
2. 选择**当前图形**，再点击一座雕像下方的**剖切**。
3. 选择另一种图形，再点击另一座雕像下方的**剖切**，完成交换。

点击**取消选择**可清除待完成的剖切，点击**新练习**可重新开始。
目标是让每座外场雕像包含对应内场图形之外的另外两种图形。
练习只展示给定的内场图形和外场立体图形，方便你在没有解题提示的情况下练习。

完成后计时停止，超时后无法继续剖切。切换到其他标签页时，计时仍会继续。
切换工具或语言会重置本轮练习。

手机屏幕高度足够时，紧凑的图形选择区会在滚动时保持在雕像附近；
矮屏和手机横屏时则随页面正常滚动。本轮进行中，重新开始按钮会作为次要操作显示。

## 本地开发

项目使用 Astro、React、TypeScript 和 Tailwind CSS，通过 Remeda 处理数组辅助操作，并使用 Radix 构建无障碍选择控件。
安装 Node.js 24 和 npm 11（11.11 或更高版本），然后在本地仓库目录中运行：

```sh
npm ci
npm run dev
```

打开终端显示的地址，通常为 <http://localhost:4321>。
按 **Ctrl+C** 停止开发服务器。

Astro 会从 Google Fonts 下载用于拉丁文字的 Noto Sans 可变字体和用于简体中文的
Noto Sans SC 可变字体，并随网站一同提供。中文字体仅包含翻译中使用的字符，翻译变更后会自动更新。
所有页面都会预加载 Noto Sans，中文页面还会预加载 Noto Sans SC。
首次启动开发服务器或进行生产构建时，需要能访问 Google Fonts。

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
浏览器报告保存在 `playwright-report/`，失败截图和追踪文件保存在 `test-results/`。
CI 仅在首次重试时记录追踪，即使重试通过也会保留；首次执行不记录追踪。
本地运行不重试，并保留首次执行失败时的追踪。
在命令的环境中设置 `BASE_PATH=/review-preview` 即可测试子目录部署。
CI 会通过矩阵在独立的运行器上并行测试这两种配置，每个任务的超时时间为 30 分钟。
在同一个本地工作目录中，根路径和子目录测试必须顺序运行。
类型、代码、格式检查和单元测试在 `test` 任务中运行。

浏览器测试覆盖 Chromium、Firefox 和 WebKit 的桌面及移动配置。Firefox 的手机测试使用小尺寸视口和触控；Firefox 不支持完整的移动设备模拟。

提交 PR 前，运行 `npm run check-all:par`，并行执行全部检查和生产页面浏览器测试。使用 `npm run check-all` 可顺序执行相同的检查。
提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)。
提交钩子会自动检查信息格式；`npm run commit` 可打开交互提示，帮助你编写提交信息。

### 开发容器

[开发容器](.devcontainer/devcontainer.json) 提供 Node.js 24、npm、GitHub CLI，
以及官方 [Codex VS Code 扩展][codex-ide]（`openai.chatgpt`），并包含 Astro、Tailwind、
ESLint、Prettier 和 Playwright 编辑器扩展。
容器通过 [Docker Compose](.devcontainer/compose.yaml) 启动，
并将本仓库挂载到 `/workspaces/verity-helper`。
配置基于 [rehua 的参考配置][devcontainer-reference]，按本项目的静态 Astro
架构调整，无需数据库或访问 Docker 套接字。

1. 安装包含 Docker Compose 的 Docker 和 VS Code 的 **Dev Containers** 扩展，打开本地仓库，
   执行 **Dev Containers: Reopen in Container**。
   也可以为此分支创建 GitHub Codespace。
2. 等待初始化完成。容器先运行 `npm ci --no-audit`，再使用项目锁定的
   Playwright 版本安装 Chromium、Firefox、WebKit 及其 Linux 依赖。
   首次配置需要联网下载容器镜像、工具、依赖包和浏览器。
3. 在容器终端运行 `npm run dev -- --host 0.0.0.0`，打开转发端口 **4321**。
   预览生产构建时，先运行 `npm run build`，再运行
   `npm run preview -- --host 0.0.0.0 --port 4322`，打开端口 **4322**。
   浏览器测试也使用此端口，因此测试前请停止手动启动的预览。

在容器内运行上文中的检查；根路径测试结束后，再运行
`BASE_PATH=/review-preview npm run test:e2e`。
拉取依赖变更后，重新运行 `npm ci --no-audit` 和
`npx playwright install --with-deps chromium firefox webkit`。
修改 `devcontainer.json` 或 `compose.yaml` 后，请重新构建容器。

Compose 会在首次使用时创建名为 `codex` 的卷，并将其挂载到
`/home/node/.codex`，并复用同一 Docker 主机上已有的 `codex` 卷。
设置和保存在文件中的登录信息会在容器重启及常规重新构建后保留。
删除此卷（包括运行 `docker compose down --volumes`）
会清除已保存的登录信息。Codespaces 的[完全重新构建][codespaces-rebuild]也会
删除 Docker 卷。更换 Docker 主机或新建 Codespace 后，需要重新登录。

登录前，请确保容器内的 `node` 用户可写入 `~/.codex`。如有需要，在容器终端运行
`sudo chown -R node:node ~/.codex && chmod 700 ~/.codex`。
在容器用户的 `~/.codex/config.toml` 中设置
`cli_auth_credentials_store = "file"`，让 Codex 将登录信息保存在挂载的卷中。
在容器窗口打开 Codex 侧栏，选择 **Sign in with ChatGPT**，
然后在扩展中选择账号可用的模型和推理强度。
其他登录方式见官方[身份验证指南][codex-auth]。

身份验证需要单独手动完成。
不要将 API 密钥、令牌、`auth.json` 或私钥放入仓库文件、Docker 构建参数或日志中。
GitHub CLI 与 Codex 分别认证；使用 GitHub 命令前，可运行 `gh auth status` 检查状态。

[devcontainer-reference]: https://github.com/BozhanL/rehua/blob/main/.devcontainer/devcontainer.json
[codex-ide]: https://developers.openai.com/codex/ide
[codex-auth]: https://developers.openai.com/codex/auth
[codespaces-rebuild]: https://docs.github.com/en/codespaces/developing-in-a-codespace/rebuilding-the-container-in-a-codespace

## 部署

部署到其他域名或子目录时，可以在构建环境中设置以下可选变量：

- `SITE_URL`：公开站点源地址，例如 `https://example.com`，用于规范链接和其他语言版本的链接。
- `BASE_PATH`：部署子目录，例如 `/verity-helper`，默认值为 `/`；导航和资源地址都会使用此路径。

本地开发无需设置这两个变量。GitHub 工作流会为正式部署和 PR 预览自动设置它们。

## 项目结构与测试

Astro 生成静态页面，React 负责交互控件。
交互控件会在 React 就绪后启用，包括在 Firefox 中重新加载页面时。

| 位置                                   | 内容                      |
| -------------------------------------- | ------------------------- |
| [pages/](src/pages/)                   | Astro 页面路由            |
| [components/](src/components/)         | 页面内容与 React 交互工具 |
| [verity.ts](src/lib/verity.ts)         | 图形规则与求解器          |
| [repository.ts](src/lib/repository.ts) | 第三关连线与共振规则      |
| [navigation.ts](src/lib/navigation.ts) | 页面路径与关卡归属        |
| [practice.ts](src/lib/practice.ts)     | 练习回合与计时            |
| [messages.ts](src/i18n/messages.ts)    | 英文和简体中文文本        |
| [global.css](src/styles/global.css)    | 共享样式                  |

Vitest 覆盖全部 126 种有效房间配置、非法输入，以及取消、完成、重置和超时等练习行为。
单人房测试覆盖雕像顺序、玩家位置和房间图形顺序的全部 162 种组合，包括重复图形与保留规则。
React 交互测试覆盖两种语言、主题偏好和键盘选择。
第三关测试覆盖房间、起点板、导体排列与当前共振的全部 162 种组合，以及推算、修正和重置行为。
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
- [Destructoid 第三关指南][repository-guide]，用于终点板连线。
- [Shacknews 救赎边缘指南][resonance-guide]，用于导体与共振规则。

[solo-guide]: https://sites.google.com/view/travelerschosen/guides/salvations-edge/verity
[repository-guide]: https://www.destructoid.com/destiny-2-salvations-edge-third-encounter-raid-guide-repository/
[resonance-guide]: https://www.shacknews.com/article/140025/salvations-edge-raid-guide-destiny-2

本项目独立实现求解器、组件及几何 SVG 图标。

项目采用 [AGPL-3.0](LICENSE) 许可证。
