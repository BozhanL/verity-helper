# E2E performance investigation

The target is for both CI E2E jobs to finish within their 30-minute limit,
including checkout, dependency installation, browser installation, and cleanup.
Keep all 450 tests, assertions, nine browser/device projects, viewports, themes,
languages, and both base paths. A meaningful improvement should reduce runtime
by roughly 20% and leave useful headroom in both jobs.

## Baseline

The investigation starts from `a1c6790a8cb27b06ac264b0198f584a6c649ba82`.
This documentation-only commit establishes an unchanged CI baseline on the
task branch before changing Playwright's configuration.

The earlier [PR #14 CI run](https://github.com/BozhanL/verity-helper/actions/runs/38925784155)
used the same E2E code and Playwright version, with two workers:

- Production attempt 2 reached 435 passing tests before the 30-minute job limit
  cancelled it. The logs contain no assertion failures.
- Subdirectory attempt 1 passed all 450 tests in 22.2 minutes. Including setup
  and cleanup, the job took approximately 23 minutes 33 seconds.

Responsive tests account for most test execution time. The current
`retain-on-failure` trace setting records traces for passing tests before
discarding them. Playwright's [CI debugging guidance](https://playwright.dev/docs/best-practices#debugging-on-ci)
recommends recording traces on the first retry to avoid this overhead.

## Decision rule

Compare the unchanged baseline and candidate on GitHub-hosted runners, including
setup overhead and checking test counts, retries, failures, and job conclusions.
If the candidate does not produce a significant improvement, explicitly revert
the performance commit, then separately increase both E2E job limits to
60 minutes. Do not suppress failures or reduce coverage to meet the limit.
