---
name: frontend-development
description: 通用前端應用開發、AI builder 專案架構、資料層與 prompt 組裝 Skill。用於規劃、審查、建置或遷移 Lovable、v0、Replit 或類似 React/TypeScript 前端 app、網站、dashboard 與工具；涵蓋 route map、專案契約、component 拆分、mock/API 資料策略、service layer 邊界、錯誤處理、HTTP 錯誤頁面、SSR/CSR 決策、theme 規劃、docs/prompts/i18n/tests/scripts 結構與分階段實作 prompts。若涉及 WordPress Headless CMS 資料契約，搭配 frontend-wordpress-headless-project 或 wordpress-rest-api-development。
---

# Frontend Development Skill

Use this skill for frontend product work that may be implemented in Lovable, v0, Replit, or a local React/TypeScript codebase. Lovable remains supported, but do not assume it is the only target platform unless the user explicitly says so.

## Core Principle

Start from the actual platform, repository, and runtime evidence. Keep the guidance platform-neutral until the user or codebase proves a specific environment.

- If the project is Lovable, use Lovable-compatible prompts, file boundaries, and publish constraints.
- If the project is v0, prefer React/Next.js-oriented component prompts and shadcn-compatible UI patterns when present.
- If the project is Replit, account for full-stack app scaffolding, runtime commands, and deployment constraints.
- If the project is a local codebase, follow the detected framework, router, styling system, package manager, and test setup.

## Trigger Context

Use this skill when the task involves:

- frontend app, website, dashboard, admin, landing page, or tool planning
- route maps, IA, page inventory, layout systems, or component decomposition
- React, TypeScript, TanStack Start, TanStack Router, Vite, Next.js, Tailwind, shadcn/ui, or similar stacks
- AI-builder prompt packs for Lovable, v0, Replit, Bolt, Cursor, or comparable tools
- mock-first data strategy, API migration planning, service layers, fixtures, typed view models, or CMS integration boundaries
- loading, empty, error, retry, timeout, offline, permission denied, and recoverable failure states
- HTTP 400/401/403/404/410/429/500/503 error routes or framework-level error pages
- SSR/CSR compatibility, hydration risk, SEO route structure, metadata readiness, or frontend publishing readiness
- theme tokens, design variables, color systems, typography, spacing, and component styling plans
- i18n, docs, scripts, QA gates, visual parity checks, and implementation staging

## Workflow

1. Identify the target platform and stack.
   - Inspect existing files before assuming a framework.
   - Detect router, rendering mode, styling system, component library, data-fetching approach, and deployment target.
   - If platform evidence conflicts with the user's label, state the evidence and proceed from the codebase.

2. Define the project contract.
   - Capture audience, primary workflows, routes, data sources, content ownership, SEO expectations, and deployment constraints.
   - Separate product requirements from platform implementation details.
   - Keep platform-specific instructions in their own section so prompts can be reused across Lovable, v0, Replit, or local implementation.

3. Plan routes and components.
   - Map routes to pages, loaders/server functions when applicable, layouts, shared components, and critical states.
   - Prefer existing app conventions over new abstractions.
   - Keep component decomposition practical: page layout, feature sections, reusable primitives, data display, forms, and feedback states.

4. Plan data and services.
   - Start with realistic mock data when the backend is not ready.
   - Define typed domain/view models and service-layer boundaries before wiring live APIs.
   - Keep API-specific normalization outside page components.
   - Define a typed error contract for expected failure modes, including validation errors, auth/permission failures, not found, rate limit, timeout, network failure, and unknown server errors.
   - Keep fetch, retry, timeout, cancellation, fallback, and error normalization inside service or route-loader boundaries; components should render normalized state instead of parsing raw errors.
   - For WordPress REST, use the WordPress-specific skills for schemas, fixtures, pagination, media, ACF, Yoast SEO, and endpoint validation.

5. Plan theme and UI system.
   - Use the theme-plan reference when the task includes visual system planning.
   - Preserve existing design tokens where present.
   - Avoid one-off hardcoded palettes when a token system exists or should exist.

6. Plan HTTP error pages and route-level failures.
   - Follow the detected router or framework conventions for 404/not-found, catch boundaries, route error elements, server errors, and static hosting fallbacks.
   - Include distinct handling for 400, 401, 403, 404, 410, 429, 500, and 503 when the framework or product scope supports it.
   - Make HTTP error pages usable, localized when the app supports i18n, accessible, responsive, and consistent with the app shell without looking like marketing pages.
   - For SEO-sensitive routes, ensure missing dynamic content returns an actual 404/410 status when the framework allows it, not a successful empty page.

7. Produce staged implementation prompts or edits.
   - For AI builders, write prompts in small, verifiable phases.
   - Each phase should name files, routes, components, data contracts, constraints, and acceptance checks.
   - Avoid platform-only terms unless targeting that platform. For example, say "AI builder knowledge/context file" unless the target is explicitly Lovable, where "Lovable Knowledge" is appropriate.

8. Verify the result.
   - Run available typecheck, lint, tests, build, and framework-specific checks.
   - For frontend changes, inspect the rendered UI when possible.
   - Verify success, loading, empty, error, retry, not found, permission denied, and server-failure states where applicable.
   - Verify HTTP error pages with direct URLs or framework route tests, including mobile and desktop layouts.
   - Check that the final result matches the requested platform scope and did not accidentally become Lovable-only.

## Error Handling

Every frontend plan or implementation must include explicit error handling at the correct boundary.

- Treat loading, empty, error, not found, unauthorized, forbidden, rate-limited, timeout, offline, and degraded-data states as first-class UI states.
- Normalize raw API, CMS, validation, and framework errors before they reach reusable components.
- Use existing framework mechanisms such as route error boundaries, loader errors, server function errors, `notFound` helpers, or error components before inventing custom global state.
- Preserve retry or recovery paths where useful, but avoid automatic retry loops that can hammer APIs or hide persistent failures.
- Ensure failures do not render a blank screen, break SSR/static generation, or silently fall back to misleading content.
- Include realistic mock fixtures or tests for expected error states when the feature touches data fetching or route loaders.

## HTTP Error Pages

When a project has routing, publishing, SSR, SSG, or static-hosting behavior, include HTTP error page planning.

- Provide a clear 404/not-found page for missing routes and missing dynamic content.
- Add 401/403 handling for protected areas, 410 handling for removed content, 429 handling for rate limits, and 500/503 handling for server or maintenance failures when relevant.
- Keep error pages inside the existing app shell or documented framework convention, with stable navigation back to a valid workflow.
- For content pages that need SEO, return the correct HTTP status where the platform supports it; do not rely only on client-side text after a 200 response.
- Verify direct navigation, refresh, deep links, static-host fallback behavior, and mobile layout for each implemented error page.

## Platform Notes

### Lovable

- Use staged prompts that fit Lovable's project-editing workflow.
- Keep Knowledge files concise and implementation-ready.
- Distinguish legacy React/Vite CSR projects from TanStack Start SSR projects.
- Pair with `lovable-legacy-to-ssr-migration` for legacy Lovable SPA to TanStack Start SSR migration.
- Pair with `frontend-wordpress-headless-project` for AI-builder or React/TypeScript frontend + WordPress Headless CMS delivery.

### v0

- Treat v0 output as React component generation unless the project context says otherwise.
- Prefer shadcn/ui-compatible component structure when the project already uses it.
- Include responsive states, empty/loading/error states, and realistic sample data in prompts.
- Avoid asking v0 to own backend behavior unless the target project includes that stack.

### Replit

- Account for runtime commands, package installation, environment variables, and preview/deploy behavior.
- When building full-stack apps, separate frontend UI requirements from server/API requirements.
- Include clear acceptance checks that can be verified in the Replit preview.

### Local Codebases

- Follow the repository's existing framework and conventions.
- Make scoped edits and verify with local scripts.
- Do not introduce AI-builder-specific files unless the user asks for them.

## Output Patterns

When planning, produce:

- project contract
- route map
- component map
- data model and service plan
- theme plan
- staged implementation prompts
- verification checklist

When implementing, produce:

- focused code edits
- updated fixtures/services/types when needed
- minimal docs or prompt files only when useful
- concrete verification results

## Reference Files

- `references/theme-plan-configuration.md`
