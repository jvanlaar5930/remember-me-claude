import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const BLOCK_MARKER = ".claude-local/";
const BLOCK = `
# Claude local project memory/cache
.claude-local/
.claude/**/*.db
.claude/**/*.sqlite
.claude/**/*.sqlite3
.claude/**/*.log`;

export async function updateGitignoreFile(rootDir) {
  const gitignorePath = join(rootDir, ".gitignore");
  let existing = "";
  try {
    existing = await readFile(gitignorePath, "utf8");
  } catch {
    // file does not exist; we'll create it
  }

  if (existing.includes(BLOCK_MARKER)) {
    return "unchanged";
  }

  const updated = existing.endsWith("\n") || existing === ""
    ? existing + BLOCK + "\n"
    : existing + "\n" + BLOCK + "\n";

  await writeFile(gitignorePath, updated, "utf8");
  return "updated";
}
