import { basename } from "path";

export function getProjectName(rootDir) {
  return basename(rootDir);
}
