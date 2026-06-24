# create-claude-repo-memory

A CLI that scaffolds Git-tracked project memory files into any repository so Claude always starts a session with context about your codebase — without scanning everything from scratch each time.

Works with any language, framework, or project type.

---

## The problem

Claude has no memory between sessions. Every time you open Claude Code in a project, it starts cold. It doesn't know your stack, your conventions, your architecture, or which files matter. You end up re-explaining things, watching it scan `node_modules`, or getting suggestions that don't match how your project works.

## The solution

Commit a set of structured Markdown files that Claude reads at the start of every session. This CLI scaffolds those files for you in seconds, then prompts Claude to fill them in by inspecting your actual codebase.

Once in place, every Claude session — and every parallel agent — starts from a shared, accurate picture of your project.

---

## Quickstart

**Step 1 — scaffold the files**

Run this inside any repository:

```bash
npx create-claude-repo-memory
```

This creates `CLAUDE.md` and a `.claude/` directory with template memory files, and updates `.gitignore` to exclude local Claude cache files.

**Step 2 — let Claude fill them in**

Open Claude Code in the same repository and run:

```
Read .claude/prompts/fill-project-map.md and execute it.
```

Claude will inspect your repository and populate the memory files with your actual stack, architecture, conventions, entry points, workflows, and more.

**Step 3 — commit**

```bash
git add CLAUDE.md .claude/ .gitignore
git commit -m "Add Claude project memory"
```

Done. Every future Claude session in this repository will read these files before doing anything else.

---

## How it works

### `CLAUDE.md`

Claude Code automatically reads `CLAUDE.md` at the start of every session. The scaffolded version instructs Claude to:

1. Read `.claude/project-map.md` first to orient itself.
2. Use the project map to find the relevant domain, files, and conventions before reading source.
3. Avoid scanning generated, build, dependency, or IDE folders by default.
4. Update memory files when it discovers or changes durable project knowledge.

### `.claude/` memory files

These files hold the actual project knowledge Claude accumulates over time:

| File | Purpose |
|------|---------|
| `project-map.md` | High-level index: stack, folder layout, entry points, major domains, critical files |
| `architecture.md` | Layers, dependency flow, data flow, external integrations, async work |
| `conventions.md` | Naming, project organization, testing, logging, error handling, API patterns |
| `workflows.md` | Build, test, deploy, release, debug, rollback steps |
| `update-project-map.md` | Rules Claude follows when deciding what to update and where |
| `domains/README.md` | Guide for creating per-domain detail files (e.g. `auth.md`, `billing.md`) |
| `prompts/fill-project-map.md` | The prompt you give Claude to fill in the memory files |

Claude keeps these files updated as it works. When it makes a change that affects architecture, conventions, or workflows, it updates the relevant memory file. The next session starts from current knowledge, not a cold start.

---

## Installation

No installation required — use `npx`:

```bash
npx create-claude-repo-memory
```

Or install globally once:

```bash
npm install -g create-claude-repo-memory
```

---

## CLI reference

```bash
create-claude-repo-memory [init] [options]
```

The bare command and `init` subcommand behave identically.

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--force` | Overwrite existing generated files | `false` |
| `--no-gitignore` | Do not update `.gitignore` | — |
| `--cwd <path>` | Directory where files should be created | current directory |

### Examples

```bash
# Scaffold into the current directory
npx create-claude-repo-memory

# Scaffold into a different directory
npx create-claude-repo-memory --cwd ./path/to/project

# Re-run and overwrite existing files (e.g. after a template update)
npx create-claude-repo-memory --force

# Scaffold without touching .gitignore
npx create-claude-repo-memory --no-gitignore

# Subcommand form with options combined
npx create-claude-repo-memory init --force --cwd ../my-repo
```

### Output

After running, the CLI prints exactly what happened:

```
Claude repo memory initialized.

Created:
  - CLAUDE.md
  - .claude/project-map.md
  ...

Skipped:
  - (any files that already existed)

Gitignore: updated

Next steps:
  1. Commit CLAUDE.md and .claude/ files.
  2. Ask Claude: "Read .claude/prompts/fill-project-map.md and execute it."
```

---

## Overwrite safety

The CLI never silently overwrites existing files.

| Situation | What happens |
|-----------|-------------|
| File does not exist | Created, listed under **Created** |
| File exists, no `--force` | Left untouched, listed under **Skipped** |
| File exists, `--force` used | Overwritten, listed under **Overwritten** |

Use `--force` to pick up template changes after upgrading the package, or to reset files you've accidentally broken.

---

## `.gitignore` behavior

By default, the CLI appends this block to `.gitignore` (creating the file if needed):

```gitignore
# Claude local project memory/cache
.claude-local/
.claude/**/*.db
.claude/**/*.sqlite
.claude/**/*.sqlite3
.claude/**/*.log
```

This excludes local-only Claude index and cache files while keeping all Markdown memory files tracked by Git.

The operation is idempotent — running the CLI multiple times will never add the block twice. Use `--no-gitignore` to skip the update entirely.

---

## Keeping memory up to date

The scaffolded files start as empty templates marked `Needs verification`. After Claude fills them in for the first time, they stay current because:

- `CLAUDE.md` instructs Claude to update the relevant memory file whenever it discovers or changes durable project knowledge.
- `update-project-map.md` defines exactly when and where to update (Claude reads this as guidance).

You can also re-run the fill prompt at any time to refresh stale sections:

```
Read .claude/prompts/fill-project-map.md and execute it.
```

### Multi-agent projects

When multiple Claude agents work in parallel on the same repository:

- Agents prefer updating domain files under `.claude/domains/` over the shared `project-map.md`.
- Memory changes live in the same branch as the code change that prompted them.
- Merge conflicts in memory files are resolved like documentation: keep facts that match current code, remove stale facts, mark uncertain items as `Needs verification`.

---

## Removing

To completely remove everything this CLI added from a repository:

**1 — delete the generated files**

```bash
rm CLAUDE.md
rm -rf .claude/
```

**2 — remove the `.gitignore` block** (if you used `--no-gitignore`, skip this)

Open `.gitignore` and delete this block:

```gitignore
# Claude local project memory/cache
.claude-local/
.claude/**/*.db
.claude/**/*.sqlite
.claude/**/*.sqlite3
.claude/**/*.log
```

**3 — commit**

```bash
git rm CLAUDE.md
git rm -r .claude/
git add .gitignore
git commit -m "Remove Claude project memory"
```

If you also installed the package globally, uninstall it:

```bash
npm uninstall -g create-claude-repo-memory
```

---

## Local development

```bash
# Clone and install
git clone <this-repo>
cd create-claude-repo-memory
npm install

# Link so the command is available globally on your machine
npm link

# Test against a scratch directory
mkdir /tmp/test-project
create-claude-repo-memory --cwd /tmp/test-project

# Or invoke directly without linking
node ./bin/cli.js --cwd /tmp/test-project
```

---

## Publishing to npm

```bash
npm login
npm publish --access public
```

---

## License

MIT
