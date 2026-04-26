# Conventions

**Date:** 2026-04-26

## Code Style & Patterns
- **Language**: Strict TypeScript. Always prefer interfaces over types. Avoid `enum`, use maps instead.
- **Functions**: Use the `function` keyword for pure functions. Arrow functions are generally preferred for inline callbacks. 
- **Variable Naming**: Descriptive names with auxiliary verbs for state flags (e.g., `isLoading`, `hasError`).
- **File Naming**: Lowercase with dashes for directories (kebab-case) (e.g., `audio-converter`).

## Architecture Conventions
- **Clean Architecture**: Follow the specific project rules for separation: Domain -> Application -> Infrastructure -> Presentation.
- **Data Access**: Strictly use the Data Access Layer (DAL) through the Repository pattern. Never access APIs or `localStorage` directly from UI or service layers without an abstract repository interface.
- **Factory Pattern**: Used for dependency injection of use cases and repositories to decouple them.

## UI & Component Conventions
- **Shadcn UI**: The primary component library. Always use existing Shadcn UI components from `@/libs/components/ui` over creating custom ones.
- **Styling**: Tailwind CSS with a mobile-first approach. Use `cn()` helper (likely from `clsx` and `tailwind-merge`) to merge custom Tailwind classes.
- **Icons**: Standardized on `lucide-react` (or `@phosphor-icons/react` based on imports).

## Next.js Best Practices
- **React Server Components (RSC)**: Minimize `'use client'`. Favor server components and Next.js SSR.
- **Performance**: Wrap client components in Suspense with fallback. Optimize images using WebP and lazy loading.
- **URL State**: Mention of using `nuqs` for URL search parameter state management (not yet listed in package.json but defined in rules).

## Linter & Formatting
- Standard ESLint config with Next.js presets.
