import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { stat } from "fs/promises";

export async function resolveTargetDirectory(cwd) {
  const resolved = resolve(cwd);
  let stats;
  try {
    stats = await stat(resolved);
  } catch {
    throw new Error(`Target directory does not exist: ${resolved}`);
  }
  if (!stats.isDirectory()) {
    throw new Error(`Target path is not a directory: ${resolved}`);
  }
  return resolved;
}

export function getPackageRoot() {
  return dirname(dirname(fileURLToPath(import.meta.url)));
}
