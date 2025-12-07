# Repository Guidelines

## Project Structure & Module Organization
- React + Vite app with entry at `src/main.jsx` and routing/composition in `src/App.jsx`.
- UI building blocks live in `src/components/`; shared utils/APIs in `src/api`, `src/lib`.
- Page-level routes live in `src/pages/` (Home, Adopt, Petz gallery, PetView, About).
- Styling is in `src/App.css` and `src/index.css`; assets and icons in `src/assets/`.
- 3D assets are served from `public/models/` (GLB files for pets and accessories).

## Build, Test, and Development Commands
- `npm install` — install dependencies.
- `npm run dev` — start Vite dev server with fast reload.
- `npm run build` — create production build in `dist/`.
- `npm run preview` — serve the production build locally.
- `npm run lint` — run ESLint (flat config) across the project.

## Coding Style & Naming Conventions
- Use 2-space indentation, modern ES modules, and JSX syntax.
- Components and files that export components use `PascalCase` (e.g., `PetPreview.jsx`); helpers use `camelCase`.
- Favor functional React components with hooks; keep side effects in `useEffect`.
- ESLint enforces `@eslint/js` + React Hooks rules; unused variables are errors (uppercase prefixes are ignored for config constants).
- Keep imports ordered: external deps, then internal modules, then styles/assets.

## Environment & Configuration
- Firebase config reads `VITE_FIREBASE_*` vars (see `src/lib/firebase.js`). Create `.env.local` with these keys when running locally; never commit secrets.
- 3D models must match material names used in code (`ass1`, `ass2` for accessories); place new models under `public/models/`.

## Testing Guidelines
- No automated test suite is present yet. When adding features, prefer lightweight checks (e.g., React Testing Library + Vitest) and snapshot critical UI states.
- Name new test files alongside code using `*.test.jsx` and cover rendering, routing, and interactions for adoption/gallery flows.
- For now, include manual verification steps in PRs (dev server run, lint pass, key user flows exercised).

## Commit & Pull Request Guidelines
- Commit messages are short, present-tense summaries similar to current history (e.g., `add gallery pagination`, `<60 chars`).
- PRs should include: scope summary, screenshots/gifs for UI changes, linked issue/task, commands/tests run, and any new env/config notes.
- Keep changes scoped and incremental; prefer small, reviewable PRs over large refactors.
