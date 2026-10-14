# Project instructions

## Development

When starting the dev server, use background mode:

```sh
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and
`astro dev logs`.

If you changed any project files during the task, run `npm run check-all:par`
before handing the work back to the user. Skip it if you made no file changes.

Production deployment must wait for both the `test` and `build` CI jobs.
The final CI result must fail if any dependency fails or is cancelled.

After completing a task that changes files and passing the required checks,
ask the user whether to create a Git commit unless they have already requested
or declined a commit for that task.

Use Conventional Commits for commit messages. The Husky `commit-msg` hook runs
commitlint; `npm run commit` opens the Commitizen prompt.

## Project structure and UI

- Use Astro for routes and layouts, and React islands for interactive tools.
- Keep puzzle rules in `src/lib/verity.ts` and exercise state in
  `src/lib/practice.ts`; reuse them across both tools.
- Update English and Simplified Chinese together in `src/i18n/messages.ts`.
  Generate navigation with Astro's i18n helpers so `BASE_PATH` is respected.
- Prefer shape diagrams and short labels. Give diagrams localized accessible
  descriptions, and retain accessible names on controls.
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
