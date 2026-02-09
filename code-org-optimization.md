# Plan: Performance and Organization Optimization ("Paper Light, Tiger Fast")

Optimize the application for better performance, clean code organization, and a premium, lightweight aesthetic.

## 📋 Overview
- **Objective:** Improve initialization speed, reduce bundle size, and refactor code for better maintainability.
- **Project Type:** WEB (Vite + React + Tailwind 4)
- **Primary Agents:** `performance-optimizer`, `frontend-specialist`, `code-archaeologist`

## ✅ Success Criteria
- [ ] Redundant external scripts (Tailwind CDN) removed.
- [ ] `App.tsx` logic decoupled into hooks and separate routing/config files.
- [ ] Improved initial load time by optimizing `index.html`.
- [ ] CSS bundles optimized via Tailwind 4 PostCSS integration.
- [ ] All linting and type checks pass.

## 🛠️ Tech Stack
- **Framework:** React 19
- **Bundler:** Vite 6
- **Styling:** Tailwind CSS 4 (PostCSS)
- **Database:** Supabase

## 📂 File Structure Changes
- Create `src/hooks/useAppLogic.ts` for main app state.
- Create `src/config/navigation.ts` for page titles and mapping.
- Create `src/routes/AppNavigator.tsx` for cleaner routing.
- Cleanup `index.html`.

## 📝 Task Breakdown

### Phase 1: Foundation & Cleanup (P0)
- **Task 1: Clean index.html**
  - **Agent:** `performance-optimizer`
  - **Action:** Remove `<script src="https://cdn.tailwindcss.com">` and move tailwind config to a proper file or let it be handled by Tailwind 4.
  - **Verify:** Page still renders correctly without external CDN script.
- **Task 2: Fix Tailwind 4 Integration**
  - **Agent:** `frontend-specialist`
  - **Action:** Ensure Tailwind 4 is correctly configured in `postcss.config.js` and `vite.config.ts` if needed.
  - **Verify:** `npm run dev` works and styles are applied.

### Phase 2: Code Refactoring (P1)
- **Task 3: Refactor App Configuration**
  - **Agent:** `code-archaeologist`
  - **Action:** Move `PAGE_TITLES` and page mapping to `src/config/navigation.ts`.
  - **Verify:** `App.tsx` is smaller and imports navigation config.
- **Task 4: Create Custom Hooks for Auth/Session**
  - **Agent:** `code-archaeologist`
  - **Action:** Extract session timer and logout logic to `src/hooks/useAuthActions.ts`.
  - **Verify:** `App.tsx` logic is more declarative.

### Phase 3: Performance Polish (P2)
- **Task 5: Optimize Lazy Loading**
  - **Agent:** `performance-optimizer`
  - **Action:** Group some small pages if necessary or ensure preloading of critical pages (Login/Register).
  - **Verify:** Navigation feels snappier.
- **Task 6: Asset Optimization**
  - **Agent:** `performance-optimizer`
  - **Action:** Review `public/` assets and ensure fast delivery.

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ No critical issues
- Build: ✅ Success
- Date: 2026-02-09
