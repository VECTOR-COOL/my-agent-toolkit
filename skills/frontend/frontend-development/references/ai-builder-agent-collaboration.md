# Cursor x AI Builder x Agent Collaboration

Use this reference when a frontend project involves Cursor, Lovable, Codex/OpenAI, or another coding/design agent working in the same repository. The goal is to prevent overlapping edits, unclear ownership, and unsafe Git recovery.

## Collaboration Matrix

- Lovable owns fast UI/page/component generation, visual iteration, route scaffolding, and interaction changes that are intentionally made through the Lovable editor.
- Cursor owns local repository editing, refactors, integration work, bulk fixes, and changes that require sustained codebase navigation.
- Codex/OpenAI owns planning, review, scoped implementation, tests, documentation, handoff notes, and risk analysis.
- Other agents must stay inside an explicit scope, avoid architecture changes, avoid broad rewrites, and avoid high-risk frontend files unless the user explicitly asks for that work.
- The human owner decides product direction, destructive Git operations, deployment, credentials, production data, and final conflict resolution.

Before editing, every agent should identify its current role, the files or subsystem it expects to touch, and any known overlap with recent work from another tool.

## Source Of Truth

- Treat the repository as the source of truth for current implementation details.
- Treat Lovable as the source of truth only for changes intentionally made in the Lovable editor and not yet reconciled into the local repo.
- Treat issue briefs, prompts, screenshots, and external notes as intent, not implementation truth, until verified against the repo.
- When sources disagree, stop and describe the conflict instead of silently choosing one.

## Frontend No-Touch Rules

Other agents should not change these files by default. They may touch them only when the task explicitly requires it, the risk is stated first, and no other agent is known to be editing the same area.

Package and install state:

- `package.json`
- `bun.lockb`
- `pnpm-lock.yaml`
- `package-lock.json`
- `yarn.lock`
- `.npmrc`

Build, router, TypeScript, and tool configuration:

- `vite.config.*`
- `tsconfig*.json`
- `eslint.config.*`
- `postcss.config.*`
- `tailwind.config.*`
- `components.json`
- TanStack Router entrypoints and generated route artifacts such as `src/routeTree.gen.ts`, router setup files, and route manifest files.

Global styles and design tokens:

- `src/index.css`
- `src/App.css`
- Tailwind v4 token and CSS variable blocks.
- Theme presets, brand tokens, color tokens, typography tokens, and related theme contract files.
- Design system primitives, especially shadcn/ui-style files such as `src/components/ui/*`.

App root and providers:

- `src/main.tsx`
- `src/App.tsx`
- Root route and root layout files.
- Global providers for i18n, theme, query client, auth, CMS, analytics, and routing.

API and data boundaries:

- `src/lib/api/*`
- `src/services/*`
- WordPress REST mappers, fixture schemas, normalized view models, and API client adapters.
- `.env*`, deployment environment files, secret-related files, and runtime configuration.

Generated, dependency, and external asset state:

- `node_modules`
- `dist`
- `.cache`
- Generated files unless the command that owns generation is part of the task.
- Large image sets, uploaded media, and `public` assets unless the task is specifically asset cleanup or asset replacement.

If a no-touch file must be changed, state:

- Why the change is required.
- What alternative was considered.
- Which exact files are expected to change.
- Whether lockfiles, generated files, or global behavior will be affected.

## Git Safety Rules

- Check `git status` before editing.
- Inspect the relevant diff before changing a file that already has modifications.
- Do not use `git reset --hard`, `git checkout -- <file>`, force push, mass deletion, or blanket overwrite unless the user explicitly asks for that operation.
- Do not revert changes made by the user or another agent unless the user explicitly approves.
- Keep commits small and coherent. Do not mix formatting, refactor, feature work, bug fixes, and unrelated file cleanup in one commit.
- Do not commit generated artifacts or lockfile changes unless they are expected for the task and have been called out.
- If the worktree is dirty, describe the modified files, whether they conflict with the task, and the recommended next step before proceeding with risky edits.

Recommended responses to dirty or conflicting worktrees:

- Continue only on files that do not overlap.
- Ask the user to commit or stash unrelated changes.
- Narrow the task to a safe subset.
- Create a follow-up task for cleanup or conflict resolution.

## Problem Codebase Policy

When build, test, typecheck, lint, or runtime behavior is already broken before the current task:

- Do not silently fold the existing issue into the current task.
- Explain the observed problem, where it appears, and whether it blocks the requested work.
- Recommend one of these paths: continue while isolating the known issue, fix the blocking issue first, reduce scope, or create a follow-up.
- Fix the issue only when it was caused by the current change, when it directly blocks the current change, or when the user explicitly approves expanding scope.

When reporting an existing problem, include enough detail for handoff:

- Command or action that exposed the issue.
- Key error message or failing area.
- Files or subsystem likely involved.
- Suggested owner: Lovable, Cursor, Codex/OpenAI, another agent, or human.

## Handoff Expectations

Each agent handoff should include:

- Scope completed.
- Files changed or intentionally avoided.
- Verification performed and unresolved failures.
- Any no-touch file that was changed and why.
- Suggested next owner for remaining work.
