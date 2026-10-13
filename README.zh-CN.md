# 真理助手

[English](README.md)

《命运 2》救赎边缘突袭第四关的双语外场剖切计算器与练习工具。
项目使用 Astro、React 和 TypeScript，两个工具共用同一套界面与解题规则。

本项目由 OpenAI Codex 根据项目所有者的需求与反馈创建。

## 页面

| 工具   | 英文页面     | 简体中文页面    |
| ------ | ------------ | --------------- |
| 计算器 | `/`          | `/zh/`          |
| 练习   | `/exercise/` | `/zh/exercise/` |

首页为计算器。顶部导航可切换工具并保留当前语言；切换语言时保留当前工具。
部署到子目录时，所有链接都会包含配置的 `BASE_PATH`。

## 使用方法

计算器：选择左侧和中间的内场图形及外场立体图形，右侧自动推算。
前两座雕像的立体图形相同时，在两个选择框中分别选择相同图形即可。
球体、三角锥和立方体排列在同一行或列；圆锥、圆柱和三棱柱为另一组。
有效房间中每种平面图形各有两个；计算器会给出交换次数最少的方案，
并提示无效输入或已完成的状态。

每次交换都按左侧、中间、右侧的雕像顺序显示三个方框。按数字依次从对应方框的雕像中
剖切图形，未参与交换的方框留空。箭头连接参与交换的雕像。每次交换下方展示交换后的房间，
最后一步即完成后的房间。

练习：开始 3:30 的随机回合，选择图形并从雕像中剖切，再从另一座雕像中剖切
不同图形。第二次剖切后完成交换。可取消待完成的剖切。练习只展示给定的内场图形和外场立体图形，
需要自行推断其组成与目标。

外场目标为对应内场图形之外的另外两种图形。

完成后计时停止，超时后禁止继续剖切。计时采用绝对截止时间，后台标签页不会延长回合。
离开页面或切换语言会重置练习状态。

## 开发与检查

使用 Node.js 24 和符合项目声明范围的 npm 11.11 或更高的 npm 11 版本。

```sh
npm install
npm run dev -- --background
```

本地地址通常为 <http://localhost:4321>。使用以下命令管理后台服务器：

```sh
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

| 命令                    | 用途                               |
| ----------------------- | ---------------------------------- |
| `npm run check-all:par` | 并行运行类型、代码、格式检查和测试 |
| `npm run check-all`     | 顺序运行上述检查                   |
| `npm test`              | 运行单元测试与 React 交互测试      |
| `npm run test:watch`    | 监听模式运行测试                   |
| `npm run build`         | 在 `dist/` 中生成静态站点          |
| `npm run preview`       | 预览生产构建                       |

完成任务并交还工作前，运行 `npm run check-all:par`。

提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)。
Husky 的 `commit-msg` 钩子会运行 commitlint；使用 `npm run commit` 打开 Commitizen 交互提示。

## 部署与实现

`astro.config.ts` 保留现有的 `en` 和 `zh` 语言配置。英文页面不带语言前缀，
中文页面使用 `/zh/`，HTML 文档声明为 `lang="zh-Hans"`。

构建时可设置 `SITE_URL` 为公开站点源地址，例如 `https://example.com`；
`BASE_PATH` 指定部署子目录，例如 `/verity-helper`，默认值为 `/`。
导航、语言链接和网站图标均支持子目录部署。本地开发无需设置 `SITE_URL`。

Astro 负责静态路由、元数据与页面外壳，通过 `client:load` 激活 React 工具。
页面使用原生链接及 Astro 的国际化辅助函数，无需额外的前端路由器或后端。
双语文本位于 `src/i18n/messages.ts`，共享样式位于 `src/styles/global.css`。

纯函数逻辑位于 `src/lib/verity.ts` 和 `src/lib/practice.ts`。
Vitest 覆盖全部 126 种有效的有序房间配置、最少交换方案、非法输入、
图形数量守恒、取消、完成、重置和超时。
React Testing Library 与 jsdom 验证两种语言下的实际控件操作。

## 参考来源

- [yugnar 的 Verity Calculator](https://yugnar.com/verityCalculator/)。
  原计算器将剖切算法归功于
  [u/swegmesterflex](https://www.reddit.com/user/swegmesterflex/)。
- [终焉之形练习页面](https://static.19970301.xyz/the_final_shape/dist/index.html#/)。

本项目独立实现参考页面的机制、求解器、React 组件及几何 SVG 图标，
运行时不加载参考页面的脚本、图片或字体。
