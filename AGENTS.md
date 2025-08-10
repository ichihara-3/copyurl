# AGENT Instructions

This repository contains a Chrome extension built with Node.js. Please follow these guidelines when updating the repository:

1. **Run Tests**
   - Install dependencies with `npm install` if needed.
   - Run `npm test` and ensure all tests pass before committing.

2. **Pull Request Summary**
   - Summarize notable changes and mention any files you modified.

3. **General Notes**
   - Do not commit `node_modules` or other generated files.
   - Distribution zips can be created via `./zip_artifacts.sh` but are not required for pull requests.
# Repository Guidelines

This repository hosts a Chrome extension (Manifest V3) that copies the current page URL and title in multiple formats (rich text, Markdown, HTML, etc.). Use this guide to develop, test, and contribute changes efficiently.

## Project Structure & Module Organization
- `src/manifest.json`: MV3 manifest and permissions.
- `src/background.js`: Service worker; context menus, icon click, settings cache.
- `src/modules/background/Copy.js`: Clipboard logic and format converters.
- `src/modules/background/menus.js`: Default context menu definitions.
- `src/options/`: Options page HTML/CSS/JS.
- `src/_locales/{en,ja}/messages.json`: i18n strings.
- `tests/`: Jest tests and minimal DOM stubs.
- `zip_artifacts.sh`: Build a distributable ZIP (uses `jq`).

## Build, Test, and Development Commands
- Install: `npm install`
- Test: `npm test` (runs Jest via Babel).
- Package: `./zip_artifacts.sh` → `copyurl_<version>.zip` in repo root.
- Load locally: Chrome → Extensions → Developer mode → Load unpacked → select `src/`.

## Coding Style & Naming Conventions
- JavaScript (ES Modules), 2‑space indent, semicolons, double quotes.
- Keep modules small and single‑purpose; prefer pure functions for logic.
- Filenames: `PascalCase.js` for modules under `modules/`, kebab/flat for others as existing.
- No new global state in content pages; use `chrome.storage.sync` for settings.
- No generated artifacts in VCS (`node_modules/`, build outputs).

## Testing Guidelines
- Framework: Jest + `babel-jest` (`tests/` contains `*.test.js`).
- Run locally with `npm test`; add tests for new logic/bug fixes.
- Prefer unit tests around formatters and menu/state transitions.
- Optional: `jest --coverage` if you want a local report (no strict threshold enforced).

## Commit & Pull Request Guidelines
- Commits: Imperative mood, concise scope, reference issues (`Fix: handle restricted pages (#123)`).
- Before PR: run `npm install && npm test`; ensure tests pass.
- PR description: purpose, user‑visible changes, risks, screenshots (options UI) when relevant, and list modified files.
- Do not commit `node_modules` or distribution ZIPs.

## Security & Configuration Tips
- Keep permissions in `manifest.json` minimal; avoid new permissions without justification.
- Clipboard operations must handle restricted pages gracefully (see `background.js` error handling).
- i18n: add new keys to both `en` and `ja` locales.

