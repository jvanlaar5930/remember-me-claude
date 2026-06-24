# Architecture: create-claude-repo-memory

## High-Level Architecture

A single-purpose CLI tool. No server, no daemon, no persistent state. One invocation = one filesystem operation against a target directory. The entire execution is synchronous from the user's perspective (async/await internally for fs calls).

## Major Layers or Components

```
bin/cli.js          — Presentation layer: argument parsing, output formatting, exit codes
src/init.js         — Application layer: orchestrates the init workflow
src/paths.js        — Infrastructure: filesystem path resolution
src/projectName.js  — Utility: derives project name
src/templateResolver.js — Utility: token substitution
src/gitignore.js    — Infrastructure: .gitignore read/write
templates/generic/  — Data: the Markdown content that gets written to target repos
```

## Dependency Flow

```
cli.js
  └── resolveTargetDirectory (paths.js)
  └── initClaudeRepoMemory (init.js)
        └── getPackageRoot (paths.js)
        └── getProjectName (projectName.js)
        └── applyTemplateVariables (templateResolver.js)
        └── updateGitignoreFile (gitignore.js)
```

`bin/cli.js` depends on `src/init.js` and `src/paths.js`. `src/init.js` depends on the other four src modules. No circular dependencies.

## Data Flow

1. User invokes CLI with optional `--cwd`, `--force`, `--no-gitignore`
2. `resolveTargetDirectory` resolves and validates the target path
3. `initClaudeRepoMemory` reads each template file from `templates/generic/`
4. `applyTemplateVariables` substitutes `{{PROJECT_NAME}}` and `{{GENERATED_BY}}`
5. Each rendered file is written to the target directory (skipped or overwritten per `--force`)
6. `updateGitignoreFile` appends the Claude cache block if not already present
7. Result object `{ created, overwritten, skipped, gitignoreStatus }` is returned to `cli.js`
8. `cli.js` formats and prints the summary

## External Integrations

None at runtime. The only external system is the npm registry (publish-time only).

## Background, Scheduled, or Async Work

None. One-shot CLI execution only.

## Data Storage and State Management

Stateless. Reads from `templates/generic/`, writes to the target directory. No database, no cache, no lock files written by the tool itself.

## Error Handling and Logging

- `resolveTargetDirectory` throws on missing or non-directory paths
- `applyTemplateVariables` throws on unreplaced `{{...}}` tokens
- `cli.js` wraps both `resolveTargetDirectory` and `initClaudeRepoMemory` in try/catch, prints `Error: <message>`, exits with code 1
- No structured logging; all output is `console.log` / `console.error`
- Success exits with code 0 (implicit); errors exit with code 1 (explicit `process.exit(1)`)

## Security and Secrets Handling

No secrets handled at runtime. Templates explicitly instruct users and Claude not to commit secrets. npm auth tokens are external to the codebase.

## Performance or Scalability Notes

Trivial workload — 8 small file writes. No performance concerns.

## Architectural Risks or Unclear Areas

- No automated tests — regressions in template content or file-write logic would only be caught manually
- `FILE_LIST` is hardcoded in `src/init.js` — adding new generated files requires a code change and a new template; no plugin/extension mechanism
- `initClaudeRepoMemory` is exported but not documented as a public API — unclear whether programmatic use should be supported in future versions
