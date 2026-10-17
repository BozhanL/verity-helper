# E2E performance investigation

The target is for both CI E2E jobs to finish within their 30-minute limit,
including checkout, dependency installation, browser installation, and cleanup.
The comparison covers all 450 tests, assertions, nine browser/device projects,
viewports, themes, languages, and both base paths. The investigation targeted a
runtime reduction of roughly 20% with useful headroom in both jobs.

## Baseline

The code baseline is `a1c6790a8cb27b06ac264b0198f584a6c649ba82`, the PR #13
feature merge. The subsequent documentation-only commit
`6f0475cc829b4b60844dfb45659220f92a191528` recorded this investigation without
changing the application, tests, or Playwright configuration. It was the commit
tested by the [baseline CI run](https://github.com/BozhanL/verity-helper/actions/runs/38987992128).
Later signature and attribution rewrites replaced that commit with
`a28b6aaaf2af3cef2fdf2c6b3d0ecb54d3561b52`, whose tree is identical; the linked
run remains evidence for the original commit.

The earlier [PR #14 CI run](https://github.com/BozhanL/verity-helper/actions/runs/38925784155)
used the same E2E code and Playwright version, with two workers:

- Production attempt 2 reached 435 passing tests before the 30-minute job limit
  cancelled it. The logs contain no assertion failures.
- Subdirectory attempt 1 passed all 450 tests in 22.2 minutes. Including setup
  and cleanup, the job took approximately 23 minutes 33 seconds.

Responsive tests account for most test execution time. The baseline
`retain-on-failure` trace setting recorded traces for passing tests before
discarding them. Playwright's [CI debugging guidance](https://playwright.dev/docs/best-practices#debugging-on-ci)
recommends recording traces on the first retry to avoid this overhead.
