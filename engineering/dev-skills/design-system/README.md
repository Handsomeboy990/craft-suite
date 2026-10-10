# design-system

Builds the shared visual and interaction language: layered tokens, component
contracts with variants and complete state inventories, theming as token sets,
composition rules, documentation including misuse, versioning, and an adoption
path that ends.

- Inputs: the existing product and its variations, the brand constraints, the
  platforms and locales in scope.
- Outputs: token set, component contracts, theme definition, usage
  documentation, adoption plan.
- Depends on: engineering-core, ui-ux-engineering.
- Upstream: brand-identity, whose signed tokens it receives.
- Lateral: frontend-engineering, accessibility-testing, internationalization,
  dependency-selection.
- Downstream: playwright-automation, technical-documentation, technical-debt.
- Handoff to code: `resources/design-to-code-handoff.md`, from a validated
  brief to a delivered site through a signed prototype, eight gated steps.

Tokens carry the decisions and components consume them by semantic name, so a
theme is one indirection away. A component that accepts arbitrary style
overrides makes the system a suggestion.
