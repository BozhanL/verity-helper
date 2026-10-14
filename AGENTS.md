# Project instructions

## Development

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

If you changed any project files during the task, run `npm run check-all:par`
before handing the work back to the user. Skip it if you made no file changes.

Production deployment must wait for both the `test` and `build` CI jobs.
The final CI result must fail if any dependency fails or is cancelled.

After completing a task that changes files and passing the required checks,
ask the user whether to create a Git commit unless they have already requested
or declined a commit for that task.

Use Conventional Commits for commit messages. The Husky `commit-msg` hook runs
commitlint; `npm run commit` opens the Commitizen prompt.
Name task branches using [Conventional Branch](https://conventionalbranch.org/),
for example `feature/solo-room-calculator`.

## Project structure and UI

- Use Astro for routes and layouts, and React islands for interactive tools.
- The calculator is `/`, solo-room distribution is `/solo/`, and exercise is
  `/exercise/`, with matching `/zh/` routes. Keep metadata and language links
  on the selected tool when adding routes.
- Keep puzzle rules in `src/lib/verity.ts` and exercise state in
  `src/lib/practice.ts`. Share shape types and puzzle rules across tools.
- Update English and Simplified Chinese together in `src/i18n/messages.ts`.
  Generate navigation with Astro's i18n helpers so `BASE_PATH` is respected.
- Prefer shape diagrams and short labels. Give diagrams localized accessible
  descriptions, and retain accessible names on controls.
- Solo-room distribution uses direct transfers: never give to your own statue
  or a statue holding the given shape. For two identical shapes different from
  your symbol, give one to the eligible teammate and keep one. Keep these rules
  in `src/lib/verity.ts` and reuse `InsideInputs.tsx` for statue selection.
- Treat exercise rounds as unaided practice: show the given inside symbols and
  outside solids without solution hints, target mappings, or shape breakdowns.
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
