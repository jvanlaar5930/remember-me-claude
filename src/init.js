import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { access } from "fs/promises";
import { getProjectName } from "./projectName.js";
import { getPackageRoot } from "./paths.js";
import { applyTemplateVariables } from "./templateResolver.js";
import { updateGitignoreFile } from "./gitignore.js";

const FILE_LIST = [
  { source: "CLAUDE.md", target: "CLAUDE.md" },
  { source: "project-map.md", target: ".claude/project-map.md" },
  { source: "architecture.md", target: ".claude/architecture.md" },
  { source: "conventions.md", target: ".claude/conventions.md" },
  { source: "workflows.md", target: ".claude/workflows.md" },
  { source: "update-project-map.md", target: ".claude/update-project-map.md" },
  { source: "domains/README.md", target: ".claude/domains/README.md" },
  { source: "prompts/fill-project-map.md", target: ".claude/prompts/fill-project-map.md" },
];

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function initClaudeRepoMemory({ rootDir, force, updateGitignore }) {
  const packageRoot = getPackageRoot();
  const templateBase = join(packageRoot, "templates", "generic");
  const projectName = getProjectName(rootDir);
  const variables = {
    PROJECT_NAME: projectName,
    GENERATED_BY: "create-claude-repo-memory",
  };

  const created = [];
  const overwritten = [];
  const skipped = [];

  for (const { source, target } of FILE_LIST) {
    const sourcePath = join(templateBase, source);
    const targetPath = join(rootDir, target);

    const rawContent = await readFile(sourcePath, "utf8");
    const content = applyTemplateVariables(rawContent, variables);

    const exists = await fileExists(targetPath);

    if (exists && !force) {
      skipped.push(target);
      continue;
    }

    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, content, "utf8");

    if (exists) {
      overwritten.push(target);
    } else {
      created.push(target);
    }
  }

  let gitignoreStatus = "skipped";
  if (updateGitignore) {
    gitignoreStatus = await updateGitignoreFile(rootDir);
  }

  return { rootDir, created, overwritten, skipped, gitignoreStatus };
}
