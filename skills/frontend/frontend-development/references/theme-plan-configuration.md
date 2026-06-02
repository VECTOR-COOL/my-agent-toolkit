# Theme Plan Configuration Reference

Use this reference to create a frontend theme plan that works across Lovable, v0, Replit, and local React/TypeScript projects.

## Inputs To Gather

- target platform or builder
- framework and router
- styling system
- component library
- existing CSS variables, Tailwind config, or design tokens
- brand assets and required colors
- page types and high-traffic workflows
- accessibility requirements
- screenshots or existing UI references

## Recommended Output

```markdown
# Theme Plan

## Context
- Platform:
- Framework:
- Styling:
- Component library:
- Audience:

## Design Direction
- Tone:
- Density:
- Visual priorities:

## Tokens
- Color:
- Typography:
- Spacing:
- Radius:
- Border:
- Shadow:

## Design System
- Foundations:
- Token layers:
- Modes:
- UI primitives:
- Feature components:
- Patterns:
- Page templates:
- Governance:
- AI builder invariants:

## Components
- Navigation:
- Buttons:
- Forms:
- Cards:
- Tables/lists:
- Dialogs/drawers:
- Feedback states:

## Responsive Rules
- Mobile:
- Tablet:
- Desktop:

## Platform Notes
- Lovable:
- v0:
- Replit:
- Local repo:

## Verification
- Typecheck/build:
- Visual inspection:
- Accessibility:
- Responsive:
```

## Guidance

- Keep platform-specific file paths out of the common sections unless the target platform is already known.
- Prefer semantic token names over raw color usage.
- Preserve existing design systems before introducing new ones.
- Include realistic component states: default, hover, active, disabled, loading, empty, error, and success.
- Define design system layers before generating page-specific UI: foundations, primitive tokens, semantic tokens, component tokens, primitives, components, patterns, templates, and content/data states.
- For AI builders, require reuse of existing tokens, primitives, components, and patterns before allowing new styles.
- When generating prompts for an AI builder, split theme implementation into small phases that can be reviewed visually.
