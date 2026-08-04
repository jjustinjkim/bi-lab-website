import { getLastUpdatedDate } from "@/lib/inventory/markdown";
import { getGitCommitHash } from "@/lib/inventory/git";

export default function Footer() {
  const lastUpdated = getLastUpdatedDate();
  const commit = getGitCommitHash();

  return (
    <footer
      className="w-full mt-16"
      style={{ borderTop: "1px solid var(--hairline)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-caption text-mono flex flex-wrap gap-x-4 gap-y-1">
        <span>Last data update: {lastUpdated}</span>
        <span aria-hidden="true">·</span>
        <span>Build: {commit}</span>
      </div>
    </footer>
  );
}
