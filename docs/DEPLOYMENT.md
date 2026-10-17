# Deployment / GitHub Pages

Goal: after the repository is created, development and deployment should be mostly automatic.

## Desired flow

```text
local/Cursor development
→ tests/lint/build
→ commit
→ push main
→ GitHub Actions
→ GitHub Pages
```

## Requirements

- Browser build must work without Yandex SDK.
- GitHub Pages build must use browser/mock adapters.
- Saves -> localStorage.
- Ads -> mock implementation returning safe test results.
- Leaderboards -> local/mock.
- Build must support GitHub Pages repository subpath.
- Do not hardcode GitHub username.

## CI checks

Before deployment:

```text
lint
test
build
```

If any fail, do not deploy the broken build.

## Repository setup task for Cursor

After the user creates and clones an empty repository, Cursor should:

1. set up the game project;
2. add `.gitignore`;
3. add package scripts for `dev`, `test`, `lint`, `build`, `preview`;
4. create GitHub Actions Pages workflow;
5. configure the build base path for `/<repository-name>/`;
6. verify direct reload does not break the app;
7. add browser/Yandex platform abstraction;
8. run a local production build;
9. document any manual GitHub setting required (normally enabling Pages via GitHub Actions);
10. maintain `IMPLEMENTATION_STATUS.md`, `HANDOFF.md`, `KNOWN_ISSUES.md`.

## Branch strategy

Keep it simple initially:
- `main` = current testable build.

A separate dev/staging branch is optional later.
