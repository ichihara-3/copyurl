# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Install dependencies**: `npm install`
- **Run tests**: `npm test`
- **Lint code**: `npm run lint` (check for issues) or `npm run lint:fix` (auto-fix)
- **Format code**: `npm run format` (auto-format) or `npm run format:check` (check only)
- **Build extension**: `npm run build` (production) or `npm run build:dev` (development)
- **Watch mode**: `npm run build:watch` (rebuild on changes)
- **Create distribution**: `npm run dist` (lint + format + test + build + zip)
- **Create distribution zip**: `./zip_artifacts.sh` (requires `jq` command)

Before committing changes, ensure all tests pass with `npm test` and code is properly formatted with `npm run format:check`. The pre-commit hooks will automatically run linting and formatting checks.

## Architecture Overview

This is a Chrome extension (Manifest V3) that copies page URLs in multiple formats. The extension uses a service worker background script and content script injection pattern.

### Key Components

- **Service Worker** (`src/background.js`): Main orchestrator handling menu creation, extension lifecycle, and script injection
- **Copy Module** (`src/modules/background/Copy.js`): Content script with clipboard operations and format converters
- **Menu Definitions** (`src/modules/background/menus.js`): Default context menu configurations
- **Options Page** (`src/options/`): User preferences for menu visibility and default format

### Data Flow

1. Background service worker registers context menus based on stored preferences
2. User triggers copy via toolbar click (uses cached default format) or context menu selection
3. Background injects Copy.js into active tab with the selected format
4. Copy module extracts page data and writes to clipboard using navigator.clipboard.write() with execCommand() fallback
5. Success notifications are shown in-page (can be disabled in options)

### Storage & Caching

The extension uses `chrome.storage.sync` for cross-device settings persistence. Background script maintains memory cache of `defaultFormat` and `showNotification` settings for performance, updated via storage change listeners.

### Testing

Jest is configured with Node.js environment. The test setup in `tests/setup.js` mocks Chrome APIs for unit testing background script modules.

### Internationalization

Uses Chrome extension i18n with messages in `src/_locales/{en,ja}/messages.json`. The manifest uses `__MSG_*__` placeholders for localized strings.

### Build System

The project uses Webpack for bundling and minification:
- **Source**: Files in `src/` directory
- **Output**: Built files in `dist/` directory
- **Minification**: JavaScript and CSS are minified in production mode
- **Development**: Source maps enabled for debugging
- **Assets**: Static files (manifest, images, locales) are copied to dist

### Code Quality Tools

- **ESLint**: Configured with Chrome extension and ES6+ rules
- **Prettier**: Code formatting with consistent style
- **Husky**: Git hooks for pre-commit checks
- **lint-staged**: Runs linting and formatting on staged files only