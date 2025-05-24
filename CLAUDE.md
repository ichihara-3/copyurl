# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Install dependencies**: `npm install`
- **Run tests**: `npm test`
- **Create distribution zip**: `./zip_artifacts.sh` (requires `jq` command)

Before committing changes, ensure all tests pass with `npm test`.

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