# Project instructions

## Development

The optional `.devcontainer/` environment installs Node.js 24, a compatible npm,
GitHub CLI, editor extensions (including the Codex VS Code extension), and the
project's Playwright browsers. The standalone Codex CLI is not installed. Keep
its tool versions aligned with `package.json` and its setup instructions in both
README files. Container creation must not sign in, embed credentials, or mount
host authentication directories; authentication remains a manual user step.

`devcontainer.json` selects the `app` service in `.devcontainer/compose.yaml`.
Compose mounts the checkout's parent directory at `/workspaces`, and
`workspaceFolder` is `/workspaces/${localWorkspaceFolderBasename}`. Keep the
workspace path aligned with the local checkout folder name and run project
commands there. Configure the container image, init process, and shared memory
in Compose.
Keep Codex state in the Compose-managed volume named `codex`, mounted at
`/home/node/.codex`, so existing logins survive container rebuilds. Compose must
create the volume on first use. Use `onCreateCommand` to give `node` ownership of
this directory and its existing contents, with directory permissions of `700`,
before installing dependencies. Never reset its contents during container setup.

When starting the dev server, use background mode:

```sh
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and
`astro dev logs`.

Keep Vite dependency caches separate for development, production, and tests.
Astro checks run in production mode and must not overwrite a running dev server's
React runtime. Verify hydration and shape selection on served pages after
interactive changes; component tests alone do not catch client startup failures.

Choose checks according to the changes:

- Documentation-only changes: run only `npm run format` before handoff.
- Code changes: run `npm run check` and `npm run lint` during development.
- No file changes: skip checks.

Browser regression tests use Playwright against production previews.
`npm run test:e2e` uses `cross-env` to set `BASE_PATH=/`.
`npm run test:e2e:subdirectory` uses `cross-env` to set
`BASE_PATH=/review-preview` across platforms. Install engines with
`npx playwright install chromium firefox webkit`.
`npm run test:e2e:all` runs the root browser suite first, then the subdirectory
suite. For full local validation when needed, `npm run check-all:par` runs type,
lint, formatting, and unit checks in parallel with `npm run test:e2e:all`.
`npm run check-all` runs all checks sequentially. Both aggregate commands include
both browser suites. Browser suites rebuild `dist/`; within the same workspace,
avoid overlapping browser runs or separate production builds because they share
build output and report directories.
Use `localhost` for both the preview host and browser base URL.
Configure browser workers as `75%` locally and `100%` in CI.
Record CI traces on the first retry to avoid tracing every passing test. Local
runs have no retries, so retain their first-failure traces. Keep failure
screenshots and all assertions, browser/device projects, and responsive cases.
Set fixed responsive viewports with `test.use({ viewport })`
before page creation.
Firefox phone coverage uses a phone-sized viewport and touch; Firefox does not
support full mobile emulation. Keep browser reports and screenshots ignored,
and inspect representative phone/tablet screenshots in both themes.
All browser projects must exercise hydrated controls.

CI runs type, lint, formatting, and unit checks in `test`. Browser tests use an
`e2e` matrix with separate root and subdirectory jobs, each with a 30-minute
timeout. CI matrix jobs have isolated runner workspaces and may run in parallel.
In a shared workspace, run root and subdirectory suites sequentially.
Production deployment must wait for `test`, `e2e`, and `build`. The final CI
result must include all jobs and fail if any dependency fails or is cancelled.

After completing a task that changes files and passing the required checks,
ask the user whether to create a Git commit unless they have already requested
or declined a commit for that task.

Use Conventional Commits for commit messages. The Husky `commit-msg` hook runs
commitlint; `npm run commit` opens the Commitizen prompt.

## Branch naming

Branch names follow the [Conventional Branch](https://conventionalbranch.org/)
specification: `<type>/<description>`, lowercase, hyphen-separated.

Types: `feature/` (or `feat/`), `bugfix/` (or `fix/`), `hotfix/`, `release/`, `chore/`.
`main`, `master` and `develop` take no prefix.

Examples: `feature/add-login-page`, `bugfix/fix-header-overflow`, `release/v1.2.0`.

When you create a branch yourself rather than at a person's direction, prefix it
with your own agent name instead — `claude/`, `codex/`, `copilot/`, `cursor/`,
or the vendor-neutral `ai/` — so the branch records who wrote it.

## Project structure and UI

- Use Astro for routes and layouts, and React islands for interactive tools.
- The encounter chooser is `/`; Repository's end-plate helper is `/repository/`.
  Verity's calculator is `/verity/`, with solo-room distribution at
  `/verity/solo/` and exercise at `/verity/exercise/`, all with matching `/zh/`
  routes. Keep page paths and encounter membership in `src/lib/navigation.ts`;
  preserve the selected page in metadata and language links.
- Keep puzzle rules in `src/lib/verity.ts` and exercise state in
  `src/lib/practice.ts`. Share shape types and puzzle rules across tools.
- Keep Repository rules in `src/lib/repository.ts`. Positions are viewed from
  the entrance facing the exit. Start-to-end wiring is L-M-R in room 1, M-L-R
  in room 2, and M-R-L in room 3. Keep receiving and closing instructions
  separate, each with the corresponding start-plate sender reminder.
- Repository accepts any two distinct conductor callouts and infers the third.
  The currently held resonance is determined by the last pickup. Changing rooms
  preserves the assigned start plate but clears callouts and held resonance;
  changing the assigned start within a room preserves these room-specific inputs.
- Update English and Simplified Chinese together in `src/i18n/messages.ts`.
  Generate navigation with Astro's i18n helpers so `BASE_PATH` is respected.
- Prefer shape diagrams and short labels. Give diagrams localized accessible
  descriptions, and retain accessible names on controls.
- Keep one adaptive interface: Exercise and pre-raid experimentation are the
  learning path. Keep mobile conductor positions in left-middle-right columns,
  with resonance selection and closing guidance visible together after scrolling
  to the callouts at 390x844. Short shape labels must retain full resonance names
  accessibly and in the expandable reference.
- Keep primary controls at least 48x48 CSS pixels and other controls at least
  44x44. Result/edit links scroll only on explicit activation and preserve inputs.
  Exercise's sticky picker must fit within a quarter of the portrait viewport;
  use normal flow on short screens and keep focused board controls unobscured.
- Solo-room distribution uses direct transfers: never give to your own statue
  or a statue holding the given shape. For two identical shapes different from
  your symbol, give one to the eligible teammate and keep one. Keep these rules
  in `src/lib/verity.ts` and reuse `InsideInputs.tsx` for statue selection.
- Treat exercise rounds as unaided practice: show the given inside symbols and
  outside solids without solution hints, target mappings, or shape breakdowns.
- Configure Noto Sans and Noto Sans SC with Astro’s Fonts API in `astro.config.ts`.
  Use Google Fonts for both families. Preload Noto Sans on all pages and
  Noto Sans SC on Chinese pages. Derive the Chinese glyph subset from the
  translations. Compose `--font-noto-sans` and `--font-noto-sans-sc` before system
  fallbacks in the shared styles. Browser layout checks must wait for fonts and
  verify Latin and Chinese font downloads with `BASE_PATH`.
- Keep theme preferences in `src/lib/theme.ts`: light, dark, or system, saved
  under `verity-theme`. Apply the resolved theme before first paint in the
  shared layout; retain the CSS system-theme fallback without JavaScript.
- Use Radix Radio Groups for single-choice shape, statue, plate, and room
  controls. Preserve empty/reset states, disabled choices, and localized
  accessible names. Disable
  interactive input until React is ready; browser tests must verify visible
  readiness and actual interaction, rather than only Astro hydration attributes.
  Apply `CONTROL_PROPS` from `src/components/controlProps.ts` to buttons,
  selects, and Radix items so Firefox cannot restore their disabled state before
  hydration. Browser readiness checks must cover fresh loads and reloads with
  scripts delayed.
- Add shared styles to `@layer components` in `src/styles/global.css` so the
  Tailwind lint configuration recognizes them.
- Update relevant Vitest tests and both README files when behavior changes.

## Documentation

Write both README files for human users and contributors. Keep agent workflow
and handover instructions in this file.

Update this file when project structure, workflows, or conventions change, or
when new guidance is needed for future tasks.

Full documentation: <https://docs.astro.build>

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
