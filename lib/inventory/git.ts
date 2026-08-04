import { execSync } from "child_process";

// Vercel sets this env var from the deployment's own git checkout; prefer it
// since it's exact and avoids shelling out. Falls back to reading the local
// git repo directly (works for local dev/build), then "unknown" if neither
// is available (e.g. a source tarball with no .git directory).
export function getGitCommitHash(): string {
  const vercelSha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (vercelSha) return vercelSha.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { cwd: process.cwd(), stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}
