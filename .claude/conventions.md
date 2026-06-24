# Conventions: create-claude-repo-memory

## Naming Conventions

- **Files:** `camelCase.js` for source modules (e.g. `templateResolver.js`, `projectName.js`)
- **Functions:** `camelCase`, verb-first (e.g. `resolveTargetDirectory`, `applyTemplateVariables`, `updateGitignoreFile`)
- **Constants:** `UPPER_SNAKE_CASE` for module-level constants (e.g. `BLOCK_MARKER`, `BLOCK`, `FILE_LIST`)
- **Template variables:** `{{UPPER_SNAKE_CASE}}` inside Markdown templates

## Project Organization

- `bin/` — executable entry point only; no business logic
- `src/` — all logic; each file has a single focused responsibility
- `templates/` — static content only; no logic
- Keep `bin/cli.js` thin: parse args, call `src/`, format output, handle exit codes

## Dependency Management

- Minimize dependencies — only `commander` is used
- No dev dependencies currently (no build, no linting config committed)
- `package-lock.json` is committed

## Application Structure

Each `src/` module exports named functions only — no default exports, no classes. Modules are pure functions over arguments; no module-level mutable state.

## Testing Conventions

No automated test framework yet. Manual testing via `node bin/cli.js --cwd <tmp-dir>`. The README documents the full manual test plan. New features should be verified against the manual plan before publishing.

## Logging Conventions

- `console.log` for all normal output (summary, next steps)
- `console.error` for error messages only
- No timestamps, no log levels, no structured logging
- Output is human-readable prose, not JSON

## Error Handling Conventions

- Throw plain `Error` with a clear message from utility functions (`paths.js`, `templateResolver.js`)
- Catch at the CLI boundary (`cli.js`) and exit with code 1
- Never swallow errors silently
- Do not use `process.exit` inside `src/` modules — only in `bin/cli.js`

## Data Access Conventions

All filesystem access via Node.js `fs/promises` named imports. No synchronous fs calls.

## API or Interface Conventions

`initClaudeRepoMemory(options)` takes a plain options object `{ rootDir, force, updateGitignore }` and returns a plain result object `{ rootDir, created, overwritten, skipped, gitignoreStatus }`. No classes, no callbacks.

## Frontend or UI Conventions

N/A — CLI only. Output is plain text to stdout/stderr.

## Infrastructure Conventions

No infrastructure. Published to npm as a public package. No CI/CD pipeline configured yet.

## Documentation Conventions

- README is the primary user-facing doc; kept in sync with CLI behavior
- Templates under `templates/generic/` serve as documentation for Claude in target repos
- No JSDoc or inline comments beyond single-line where non-obvious
