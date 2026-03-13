# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

大港開唱 2026 (Megaport Festival 2026) — a static PWA schedule planner for a music festival. No backend, no npm, no tests. All user data stored in IndexedDB/localStorage.

Deployed at: https://luchichitw.github.io/megaport2026/

## Build

```bash
./build.sh          # Transpile app.jsx → app.js (Babel JSX-only, no minification)
```

Babel is pre-installed at `/tmp/babel-compile/node_modules`. No `npm install` needed. There is no test runner, linter, or CI pipeline for the root project.

To serve locally: `npx serve -p 8000` or any static file server.

## Architecture

Single-page React 18 app loaded via CDN (`vendor/react.min.js`, `vendor/react-dom.min.js`). No build system beyond Babel JSX transform.

**Key files:**
- `index.html` — App shell, all CSS (including Liquid Glass design tokens as `--css-vars`), PWA registration
- `app.jsx` — Entire React app in one file (~2600 lines). **Always run `./build.sh` after editing.**
- `app.js` — Transpiled output. Never edit directly.
- `schedule.js` — Festival schedule data: `STAGES`, `STAGE_LOCS`, `STAGE_REGIONS`, `T` (performance array)
- `artists.js` — `ARTIST_DESC` (bios), `ARTIST_EMBED` (streaming platform IDs)
- `sw.js` — Service Worker (cache-first, version `mp2026-v6`). Bump version when updating cached assets.

**Data loaded as global variables** via `<script>` tags, not imports.

## Data Structures

Schedule entry: `{ id, day, stage, artist, start, end }` — day is 1 or 2, times are "HH:MM" strings.

Artist embed formats (both supported):
```js
// Single artist (flat)
"椅子樂團": { spotify: "ID", appleMusic: "ID", streetvoice: "ID", youtube: "ID" }

// Multi-artist performance
"LAWA ft. Angie安吉": { artists: [
  { name: "LAWA", spotify: "ID", appleMusic: "ID" },
  { name: "Angie安吉", spotify: "ID" },
] }
```

Platform keys: `spotify`, `appleMusic`, `streetvoice`, `youtube`, `spotifyPodcast` (uses `/embed/show/` URL).

## Theme System

Liquid Glass design with CSS custom properties on `:root` (dark default) and `[data-theme="light"]` override. Key token groups: `--glass-*`, `--surface-*`, `--text-*`, `--seg-*`. Theme preference stored in `localStorage('theme-pref')`, managed by `useTheme()` hook.

## Key Patterns

- **Time helpers:** `t2m("HH:MM")` converts to minutes, used throughout for comparisons
- **User selections:** Stored in IndexedDB (key `"v"`) via `usePersist()` hook
- **Feature flag:** `SHOW_EMBED = localStorage.getItem('show-embed') === 'true'` — controls streaming embed visibility
- **Long press → tooltip:** `useLongPress()` hook triggers artist info overlay on mobile
- **Conflict detection:** `clash()` compares time ranges for schedule conflicts

## Language

UI and content are in Traditional Chinese (繁體中文). Code variables/comments mix English and Chinese.
