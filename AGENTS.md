# CloudBox Workspace Rules (Always On)

- **TypeScript strict, no `any`**: Ensure strict type safety throughout the codebase.
- **Small focused components**: Split UI into atomic, modular pieces with single responsibility.
- **No business logic inside components**: All data handling, storage logic, and mutations live cleanly in repositories and hooks.
- **Centralized Vietnamese i18n**: Every user-facing string lives in one centralized dictionary (`src/lib/i18n/vi.ts` / `src/lib/i18n/index.ts`). No hard-coded prose in components.
- **Accessibility & Keyboard support**: Every interactive element is keyboard-reachable, has a visible focus ring (`focus-visible:ring-2`), and an accurate Vietnamese `aria-label`.
- **Strict Design Tokens**: Use Tailwind CSS variables and design tokens only; never hard-code hex colors or arbitrary colors in components.
- **Curated Dependencies**: Prefer well-documented standard libraries; justify each dependency in the implementation plan.
- **Multi-viewport & Theme Verification**: Verify every UI change in the browser across 390px, 768px, 1440px, and 1920px in both Light and Dark modes.
