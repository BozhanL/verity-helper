# Salvation’s Edge Helper

[简体中文](README.zh-CN.md)

Helpers for encounters 3 and 4 of Destiny 2’s Salvation’s Edge raid.
Find Repository plates and resonance destinations, or use Verity’s dissection
calculator, solo-room calculator, and practice tool.
Available in English and Simplified Chinese.

## Use the tools

| Page                    | English                 | Simplified Chinese    |
| ----------------------- | ----------------------- | --------------------- |
| Encounter chooser       | [Home][home-en]         | [首页][home-zh]       |
| Encounter 3: Repository | [Plate helper][repo-en] | [终点板助手][repo-zh] |
| Verity: Dissection      | [Dissection][calc-en]   | [剖切][calc-zh]       |
| Verity: Solo room       | [Solo room][solo-en]    | [单人房][solo-zh]     |
| Verity: Exercise        | [Exercise][exercise-en] | [练习][exercise-zh]   |

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

Use the header to switch tools without changing the language, or switch
languages while staying on the same page. Verity’s solo room and exercise are
grouped under Verity alongside **Dissection**. The interactive tools require JavaScript.

Use **Theme** in the header to choose **Light**, **Dark**, or **System**.
System follows your device setting. Your choice is saved when browser storage
is available and applies across tools and languages.

The tools adapt to phone and tablet layouts. Shape and statue choices support
touch, **Tab**, arrow keys, and **Space**.

Use **Exercise** on a PC to learn dissection, and try the calculators before the
raid starts. The same interface works during the raid on your phone, with large
touch targets, compact diagrams, and a visible **Controls ready** status.
There is no separate learning or in-raid configuration.

## Repository (encounter 3)

1. Select your **Assigned start plate**, then **Room / phase** (1, 2, or 3).
   Follow **Receive the pulse** to the end plate, and ask the indicated start
   plate sender to send.
2. Enter any two **Conductor callouts**, using each conductor’s end-plate
   position. The third resonance is inferred automatically. Duplicate callouts
   are disabled; use **Clear** to change which two conductors you enter.
3. Select **Your current resonance**: circle/Spherical, triangle/Pyramidal,
   or square/Hexahedron. Your last pickup determines this type.
4. Follow **Close the conductor** to the destination end plate, and ask its
   corresponding start plate sender to send. **Stay** means you are already
   at the correct receiving plate.

Positions are viewed from the entrance, facing the exit. The wiring is:

| Room | Left start → end | Middle start → end | Right start → end |
| ---- | ---------------- | ------------------ | ----------------- |
| 1    | Left             | Middle             | Right             |
| 2    | Middle           | Left               | Right             |
| 3    | Middle           | Right              | Left              |

Changing rooms keeps your assigned start plate but clears conductor callouts and
held resonance. Changing the start plate within the same room keeps those inputs.
**Reset** clears everything. Switching pages or languages resets the helper.

Conductor positions stay in left–middle–right order on phones. Controls use short
shape names; open **Resonance names** for their full in-game names. Your current
resonance and closing instructions follow the callouts, so you can read the
destination and sender together.

## Verity calculator (encounter 4)

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

After entering the shapes, use **View result** to jump to the sequence and
**Edit inputs** to return without clearing your choices. Incorrect combinations
identify which inputs to recheck. Results update immediately when inputs change;
the page scrolls only when you choose a link.

### Solo room

1. Select the left and middle **Inside statues** symbols; the right is automatic.
2. Under **Your statue**, select your own position.
3. Select both **Room shapes** to see the **Shape distribution**.

Each card identifies a statue by its position and held symbol. **Give** shows
the shape to send there; **Keep** shows what stays in your room. A shape is
never assigned to your own statue or a statue holding that shape.

**Nothing to give** and **Nothing to keep** explicitly identify empty actions.
The same **View result** and **Edit inputs** links are available here.

With two copies of your own symbol, give one to each other player. With two
copies of another symbol, give one to the eligible other player and keep one.
Different shapes are distributed directly to the two other players.

### Exercise

1. Under **Next exercise**, choose **Timed · 3:30** (the default) or **Untimed**.
   Click **Start exercise** to begin a random round.
2. Select a shape under **Current shape**, then click **Excise** under a statue.
3. Choose a different shape and click **Excise** under another statue to
   complete the swap.

Use **Cancel selection** to clear a pending cut, or **New exercise** to start
over. Your goal is to give each outside statue the two shapes that differ from
its matching inside symbol. The exercise shows only the given inside symbols
and outside solids, so you can practice without solution hints.

Timed rounds stop the clock when you finish and block further moves when time
runs out. The clock keeps counting down in background tabs. Untimed rounds have
no countdown or expiry and use the same puzzles, controls, and completion rules.
Changing **Next exercise** affects only the next **Start exercise** or
**New exercise**; it preserves the active board, pending cut, and timer.
Untimed practice gives learners more time.
It is a practice option, not a change to the raid’s timer. Switching tools or
languages resets the round.

On phones, the compact shape picker stays near the board while scrolling when
there is enough screen height. It scrolls normally on short screens and in phone
landscape. Restart remains available as a secondary action during a round.

## Local development

The project uses Astro, React, TypeScript, and Tailwind CSS, with Remeda for
array helpers and Radix for accessible selection controls. Install Node.js 26
and npm 11 (version 11.20.0 or later), then run these commands from your local clone:

```sh
npm ci
npm run dev
```

Open the address printed in the terminal, usually <http://localhost:4321>.
Press **Ctrl+C** to stop the development server.

Astro downloads variable Noto Sans for Latin text and Noto Sans SC for Simplified
Chinese from Google Fonts, then serves both with the site. The Chinese font
includes the characters used by the translations and updates automatically when
they change. Noto Sans is preloaded on all pages; Noto Sans SC is preloaded on
Chinese pages. The first development or production build needs access to
Google Fonts.

Checks cover types, lint, formatting, unit tests, and browser tests.
For code changes, run `npm run check` and `npm run lint` during development.
For documentation-only changes, run `npm run format`.

| Command                         | Purpose                                   |
| ------------------------------- | ----------------------------------------- |
| `npm run check`                 | Check types and Astro diagnostics         |
| `npm run lint`                  | Run lint checks                           |
| `npm run format`                | Check formatting                          |
| `npm run check-all:par`         | Parallel checks; sequential E2E suites    |
| `npm run check-all`             | Run all checks sequentially               |
| `npm test`                      | Run unit and React interaction tests      |
| `npm run test:e2e`              | Test desktop and mobile browsers          |
| `npm run test:e2e:subdirectory` | Run browser tests under `/review-preview` |
| `npm run test:e2e:all`          | Run both browser suites sequentially      |
| `npm run test:watch`            | Rerun tests as files change               |
| `npm run format:fix`            | Format the project                        |
| `npm run build`                 | Generate the static site in `dist/`       |
| `npm run preview`               | Preview the production build locally      |

Run `npm run build` before `npm run preview`.

Install browser test engines once with
`npx playwright install chromium firefox webkit`.
Then run `npm run test:e2e`; it builds and serves production pages at `/`
automatically, overriding any existing `BASE_PATH` value.
Browser reports are saved in `playwright-report/`, with failure screenshots and
traces in `test-results/`. CI records traces only on the first retry, including
when that retry passes; the initial attempt has no trace. Local runs have no
retries and retain the initial failure trace. Run `npm run test:e2e:subdirectory`
to test a subdirectory build. This script uses `cross-env` to set
`BASE_PATH=/review-preview` on Windows, macOS, and Linux. CI runs both
configurations in parallel matrix jobs on separate runners, with a 30-minute
timeout per job. In a local workspace, run the root and subdirectory suites
sequentially. Type, lint, formatting, and unit checks run in the `test` job.

The browser matrix covers Chromium, Firefox, and WebKit with desktop and mobile
presets. Firefox phone coverage uses a small viewport and touch; full mobile
emulation is unavailable in Firefox.

For full local validation when needed, `npm run check-all:par` runs type, lint,
formatting, and unit checks in parallel with `npm run test:e2e:all`. That script
runs the root browser suite followed by `/review-preview`. `npm run check-all`
runs all checks sequentially.
Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
The commit hook checks your message automatically; `npm run commit` opens an
interactive prompt to help write it.

### Development container

The [dev container](.devcontainer/devcontainer.json) provides Node.js 26,
npm 11, GitHub CLI, and the official [Codex VS Code extension][codex-ide]
(`openai.chatgpt`). It also includes editor extensions for Astro, Tailwind,
ESLint, Prettier, and Playwright.
It uses [Docker Compose](.devcontainer/compose.yaml) to start the container
and mount the checkout's parent directory at `/workspaces`. The workspace opens
at `/workspaces/${localWorkspaceFolderBasename}`, so its path follows the local
checkout folder name (for example, `/workspaces/verity-helper`).
The configuration adapts the [rehua reference][devcontainer-reference] to this
static Astro project; it needs no database or Docker socket access.

1. Install Docker with Docker Compose and VS Code's **Dev Containers** extension,
   open this clone, and run **Dev Containers: Reopen in Container**.
   Alternatively, create a GitHub Codespace for this branch.
2. Wait for setup to finish. It runs `npm ci --no-audit`, then installs Chromium,
   Firefox, WebKit, and their Linux dependencies using the project's locked
   Playwright version. Initial setup requires network access to download the
   container image, tools, packages, and browsers.
3. In the container terminal, run `npm run dev -- --host 0.0.0.0` and open
   forwarded port **4321**. For a production preview, run `npm run build`, then
   `npm run preview -- --host 0.0.0.0 --port 4322` and open port **4322**.
   Stop a manual preview before running browser tests, which use that port.

Use the same checks inside the container. `npm run test:e2e:all` tests both
deployment paths in sequence.
After pulling dependency changes, rerun `npm ci --no-audit` and
`npx playwright install --with-deps chromium firefox webkit`.
Rebuild the container after changing `devcontainer.json` or `compose.yaml`.

Compose creates the named `codex` volume on first use and mounts it at
`/home/node/.codex`. It reuses an existing `codex` volume on the same Docker host.
Settings and file-based login details survive container restarts and normal
rebuilds. Removing this volume, including with `docker compose down --volumes`,
clears the saved login. A Codespaces [full rebuild][codespaces-rebuild] also
removes Docker volumes. A different Docker host or a new Codespace needs its
own sign-in.

On creation and rebuild, setup gives `node` ownership of `/home/node/.codex`
and its existing contents, and limits directory access to that user before
installing dependencies. Saved settings and login files are preserved.

Set `cli_auth_credentials_store = "file"` in the container user's
`~/.codex/config.toml` so Codex stores its login in the mounted volume.
Open the Codex sidebar in the container window and choose **Sign in with
ChatGPT**. Choose your available model and reasoning effort in the extension.
See the official [authentication guide][codex-auth] for other sign-in options.

Authentication is a separate, manual step. Keep API keys, tokens, `auth.json`,
and private keys out of repository files, Docker build arguments, and logs.
GitHub CLI authentication is separate from Codex; check `gh auth status` before
using GitHub commands.

[devcontainer-reference]: https://github.com/BozhanL/rehua/blob/main/.devcontainer/devcontainer.json
[codex-ide]: https://developers.openai.com/codex/ide
[codex-auth]: https://developers.openai.com/codex/auth
[codespaces-rebuild]: https://docs.github.com/en/codespaces/developing-in-a-codespace/rebuilding-the-container-in-a-codespace

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
Interactive controls stay disabled until React is ready, including when
reloading in Firefox.

| Location                               | Contents                       |
| -------------------------------------- | ------------------------------ |
| [pages/](src/pages/)                   | Astro page routes              |
| [components/](src/components/)         | React tools and page content   |
| [verity.ts](src/lib/verity.ts)         | Puzzle rules and solver        |
| [repository.ts](src/lib/repository.ts) | Plate and resonance rules      |
| [navigation.ts](src/lib/navigation.ts) | Page and encounter paths       |
| [practice.ts](src/lib/practice.ts)     | Exercise rounds and timer      |
| [messages.ts](src/i18n/messages.ts)    | English and Simplified Chinese |
| [global.css](src/styles/global.css)    | Shared styles                  |

Vitest covers all 126 valid room configurations, invalid inputs, and exercise
behavior, including cancellation, completion, reset, and timer expiry.
Solo tests cover all 162 combinations of statue order, player position, and
ordered room shapes, including duplicate shapes and retention.
React interaction tests cover both languages, theme preferences, and keyboard
selection. Repository tests cover all 162 combinations of room, assigned start,
conductor permutation, and held resonance, plus inference, corrections, and resets.
Playwright checks hydrated production pages in Chromium, Firefox,
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
- [Destructoid’s Repository guide][repository-guide] for plate wiring.
- [Shacknews’ Salvation’s Edge guide][resonance-guide] for conductor and
  resonance rules.

[solo-guide]: https://sites.google.com/view/travelerschosen/guides/salvations-edge/verity
[repository-guide]: https://www.destructoid.com/destiny-2-salvations-edge-third-encounter-raid-guide-repository/
[resonance-guide]: https://www.shacknews.com/article/140025/salvations-edge-raid-guide-destiny-2

This project independently implements the solver, components, and geometric SVG
icons.

Licensed under [AGPL-3.0](LICENSE).
