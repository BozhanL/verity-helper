# Verity Helper

[简体中文](README.zh-CN.md)

Calculators and a practice tool for the Verity encounter of Destiny 2’s
Salvation’s Edge raid. Plan outside dissection or solo-room shape transfers.
Available in English and Simplified Chinese.

## Use the tools

| Tool       | English                 | Simplified Chinese  |
| ---------- | ----------------------- | ------------------- |
| Calculator | [Calculator][calc-en]   | [计算器][calc-zh]   |
| Solo room  | [Solo room][solo-en]    | [单人房][solo-zh]   |
| Exercise   | [Exercise][exercise-en] | [练习][exercise-zh] |

[calc-en]: https://verity.903684.xyz/
[calc-zh]: https://verity.903684.xyz/zh/
[solo-en]: https://verity.903684.xyz/solo/
[solo-zh]: https://verity.903684.xyz/zh/solo/
[exercise-en]: https://verity.903684.xyz/exercise/
[exercise-zh]: https://verity.903684.xyz/zh/exercise/

Use the header to switch tools without changing the language, or switch
languages while staying on the same tool. All three tools require JavaScript.

Use **Theme** in the header to choose **Light**, **Dark**, or **System**.
System follows your device setting. Your choice is saved when browser storage
is available and applies across tools and languages.

The tools adapt to phone and tablet layouts. Shape and statue choices support
touch, **Tab**, arrow keys, and **Space**.

## Calculator

1. Under **Inside statues**, select the left and middle symbols.
2. Under **Outside solids**, select the left and middle solids. You can select
   the same solid for both statues.
3. Follow the numbered cuts under **Dissection sequence**. Each pair of cuts
   completes one swap.

The right statue is filled in automatically, and the calculator finds the fewest
swaps. The outside solids must contain exactly two circles, two triangles, and
two squares in total. The calculator reports invalid combinations and rooms that
are already aligned.

Each swap diagram shows three boxes in left–middle–right statue order. Excise the
shape marked **1**, then **2**, from the indicated statues. The solids below each
swap show the resulting room; the last step shows the completed room.

## Solo room

1. Select the left and middle **Inside statues** symbols; the right is automatic.
2. Under **Your statue**, select your own position.
3. Select both **Room shapes** to see the **Shape distribution**.

Each card identifies a statue by its position and held symbol. **Give** shows
the shape to send there; **Keep** shows what stays in your room. A shape is
never assigned to your own statue or a statue holding that shape.

With two copies of your own symbol, give one to each other player. With two
copies of another symbol, give one to the eligible other player and keep one.
Different shapes are distributed directly to the two other players.

## Exercise

1. Click **Start exercise** to begin a random 3:30 round.
2. Select a shape under **Current shape**, then click **Excise** under a statue.
3. Choose a different shape and click **Excise** under another statue to
   complete the swap.

Use **Cancel selection** to clear a pending cut, or **New exercise** to start
over. Your goal is to give each outside statue the two shapes that differ from
its matching inside symbol. The exercise shows only the given inside symbols
and outside solids, so you can practice without solution hints.

The timer stops when you finish and blocks further moves when time runs out.
It keeps counting down in background tabs. Switching tools or languages resets
the round.

## Local development

The project uses Astro, React, TypeScript, and Tailwind CSS, with Remeda for
array helpers and Radix for accessible selection controls. Install Node.js 24
and npm 11 (version 11.11 or later), then run these commands from your local clone:

```sh
npm ci
npm run dev
```

Open the address printed in the terminal, usually <http://localhost:4321>.
Press **Ctrl+C** to stop the development server.

Checks cover types, lint, formatting, unit tests, and browser tests.

| Command                 | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `npm run check-all:par` | Run all checks in parallel                     |
| `npm run check-all`     | Run all checks sequentially                    |
| `npm test`              | Run unit and React interaction tests           |
| `npm run test:e2e`      | Test desktop and mobile browser configurations |
| `npm run test:watch`    | Rerun tests as files change                    |
| `npm run format:fix`    | Format the project                             |
| `npm run build`         | Generate the static site in `dist/`            |
| `npm run preview`       | Preview the production build locally           |

Run `npm run build` before `npm run preview`.

Install browser test engines once with
`npx playwright install chromium firefox webkit`.
Then run `npm run test:e2e`; it builds and serves production pages automatically.
Browser reports are saved in `playwright-report/`, with screenshots and failure
traces in `test-results/`. Set `BASE_PATH=/review-preview` in the command's
environment to test a subdirectory build. CI runs both configurations.

The browser matrix covers Chromium, Firefox, and WebKit with desktop and mobile
presets. Firefox phone coverage uses a small viewport and touch; full mobile
emulation is unavailable in Firefox.

Before opening a pull request, run `npm run check-all:par` to run all checks,
including production browser tests, in parallel. Use `npm run check-all` to run
the same checks sequentially.
Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
The commit hook checks your message automatically; `npm run commit` opens an
interactive prompt to help write it.

## Deployment

Set these optional environment variables when building for another domain or
a subdirectory:

- `SITE_URL`: the public origin, such as `https://example.com`, used for
  canonical and alternate-language links.
- `BASE_PATH`: the deployment subdirectory, such as `/verity-helper`.
  Defaults to `/`; navigation and assets use this path.

Local development works without either variable. GitHub workflows set them for
production and PR previews.

## Project structure and tests

Astro builds the static pages, and React handles the interactive controls.

| Location                            | Contents                       |
| ----------------------------------- | ------------------------------ |
| [pages/](src/pages/)                | Astro page routes              |
| [components/](src/components/)      | React tools and page content   |
| [verity.ts](src/lib/verity.ts)      | Puzzle rules and solver        |
| [practice.ts](src/lib/practice.ts)  | Exercise rounds and timer      |
| [messages.ts](src/i18n/messages.ts) | English and Simplified Chinese |
| [global.css](src/styles/global.css) | Shared styles                  |

Vitest covers all 126 valid room configurations, invalid inputs, and exercise
behavior, including cancellation, completion, reset, and timer expiry.
Solo tests cover all 162 combinations of statue order, player position, and
ordered room shapes, including duplicate shapes and retention.
React interaction tests cover both languages, theme preferences, and keyboard
selection. Playwright checks hydrated production pages in Chromium, Firefox,
and WebKit,
including phone and tablet portrait/landscape layouts, both themes, and
root/subdirectory navigation. Production deployment waits for tests and the
production build to succeed.

## Credits

This project was created by OpenAI Codex, guided by the project owner's
requirements and feedback.

Inspired by these tools:

- [yugnar’s Verity Calculator](https://yugnar.com/verityCalculator/).
  The original calculator credits
  [u/swegmesterflex](https://www.reddit.com/user/swegmesterflex/) for its
  dissection algorithm.
- [The Final Shape exercise](https://static.19970301.xyz/the_final_shape/dist/index.html#/).
- [Traveler’s Chosen Verity guide][solo-guide], including direct solo transfers.

[solo-guide]: https://sites.google.com/view/travelerschosen/guides/salvations-edge/verity

This project independently implements the solver, components, and geometric SVG
icons.

Licensed under [AGPL-3.0](LICENSE).
