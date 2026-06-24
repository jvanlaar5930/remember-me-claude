# Workflows: create-claude-repo-memory

## Add a New Feature

1. Implement in the relevant `src/` module, or add a new module if the concern is genuinely new
2. If adding a new generated file: add it to `FILE_LIST` in `src/init.js` and create the template in `templates/generic/`
3. Update `bin/cli.js` if new CLI options are needed
4. Test manually (see **Validate Before Commit** below)
5. Update README if the user-facing behavior changes
6. Bump version in `package.json` (patch for fixes, minor for new features)

## Add or Update a Test

No test framework is set up. To add one:
1. `npm install --save-dev <framework>` (e.g. `node:test` built-in needs no install)
2. Create `test/` directory
3. Add `"test": "node --test"` (or equivalent) to `package.json` scripts
4. Update this file and `project-map.md` after adding tests

## Trace a Bug

1. Reproduce with `node bin/cli.js --cwd <tmp-dir>` and relevant flags
2. The most likely failure points:
   - `src/init.js` — FILE_LIST or file-write logic
   - `src/templateResolver.js` — unreplaced placeholder error
   - `src/gitignore.js` — idempotency check or file encoding
   - `src/paths.js` — `getPackageRoot()` resolving incorrectly
3. Add a `console.log` or use `node --inspect` for interactive debugging

## Modify Data or State-Related Code

N/A — no databases or persistent state. All state is the filesystem of the target repo passed via `--cwd`.

## Work With Configuration and Secrets

No runtime configuration. For npm publishing, use a granular access token stored in your local npm config (`npm set //registry.npmjs.org/:_authToken <token>`). Never commit tokens.

## Update External Integrations

The only external system is the npm registry. To update:
- Token management: `npm set //registry.npmjs.org/:_authToken <token>`
- Publish: `npm publish --access public` (or `--otp <code>` if using TOTP)

## Build and Run Locally

```bash
# No build step needed. Run directly:
node bin/cli.js --help
node bin/cli.js --cwd /tmp/test-project

# Or link for global use:
npm link
create-claude-repo-memory --cwd /tmp/test-project
```

## Validate Before Commit

Run the full manual test plan:

```bash
# 1. First run — should create all files
mkdir /tmp/ccm-test
node bin/cli.js --cwd /tmp/ccm-test
# Expected: 8 files created, gitignore updated

# 2. Second run — should skip all files
node bin/cli.js --cwd /tmp/ccm-test
# Expected: 8 files skipped, gitignore unchanged

# 3. Force run — should overwrite all files
node bin/cli.js --cwd /tmp/ccm-test --force
# Expected: 8 files overwritten, gitignore unchanged (already has block)

# 4. Missing directory — should error with exit code 1
node bin/cli.js --cwd /tmp/does-not-exist
echo $?  # should be 1

# 5. Verify no unreplaced placeholders
grep -r '{{' /tmp/ccm-test/
# Expected: no output
```

## Deployment or Release

```bash
# 1. Bump version in package.json (follow semver)
# 2. Commit the version bump
git add package.json package-lock.json
git commit -m "Bump version to x.y.z"
git push

# 3. Publish to npm
npm publish --access public
# If 2FA required: npm publish --access public --otp <code>
```

## Rollback or Recovery

npm does not support unpublishing versions older than 72 hours (except for security issues). To deprecate a broken release:

```bash
npm deprecate create-claude-repo-memory@x.y.z "Reason for deprecation"
```

Then publish a corrected version immediately.
