#!/usr/bin/env node
import { Command } from "commander";
import { resolveTargetDirectory } from "../src/paths.js";
import { initClaudeRepoMemory } from "../src/init.js";

const program = new Command();

program
  .name("create-claude-repo-memory")
  .description("Scaffold Git-tracked Claude project memory files for any repository.")
  .version("0.1.0");

function addInitOptions(cmd) {
  return cmd
    .option("--force", "Overwrite existing generated files.", false)
    .option("--no-gitignore", "Do not update .gitignore.")
    .option("--cwd <path>", "Directory where files should be created.", process.cwd());
}

async function runInit(options) {
  const { force, gitignore: updateGitignore, cwd } = options;

  let rootDir;
  try {
    rootDir = await resolveTargetDirectory(cwd);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  let result;
  try {
    result = await initClaudeRepoMemory({ rootDir, force, updateGitignore });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  const { created, overwritten, skipped, gitignoreStatus } = result;

  console.log("\nClaude repo memory initialized.\n");

  if (created.length > 0) {
    console.log("Created:");
    for (const f of created) console.log(`  - ${f}`);
    console.log();
  }

  if (overwritten.length > 0) {
    console.log("Overwritten:");
    for (const f of overwritten) console.log(`  - ${f}`);
    console.log();
  }

  if (skipped.length > 0) {
    console.log("Skipped:");
    for (const f of skipped) console.log(`  - ${f}`);
    console.log();
  }

  console.log(`Gitignore: ${gitignoreStatus}\n`);

  console.log("Next steps:");
  console.log("  1. Commit CLAUDE.md and .claude/ files.");
  console.log('  2. Ask Claude: "Read .claude/prompts/fill-project-map.md and execute it."');
  console.log();
}

// Default behavior (no subcommand) = init
program
  .action(async () => {
    await runInit(program.opts());
  });

addInitOptions(program);

const initCmd = program
  .command("init")
  .description("Scaffold Claude project memory files into the target repository.");

addInitOptions(initCmd);

initCmd.action(async (options) => {
  await runInit(options);
});

program.parseAsync(process.argv).catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
