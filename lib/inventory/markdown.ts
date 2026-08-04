import fs from "fs";
import path from "path";

const DOCS_DIR = path.join(process.cwd(), "docs");

export function getLastUpdatedDate(): string {
  const changelogPath = path.join(DOCS_DIR, "changelog.md");
  if (!fs.existsSync(changelogPath)) return "unknown";
  const raw = fs.readFileSync(changelogPath, "utf-8");
  const match = raw.match(/## (\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "unknown";
}
