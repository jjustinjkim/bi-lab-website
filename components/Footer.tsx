export default function Footer() {
  return (
    <footer className="w-full mt-16" style={{ borderTop: "1px solid var(--hairline)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap justify-between gap-4 text-caption">
        <div>
          <div className="font-semibold" style={{ color: "var(--foreground)" }}>
            Bi Lab, Skull Base Tumor Laboratory
          </div>
          <div>60 Fenwood Road, Boston, MA 02115</div>
        </div>
        <div className="flex flex-col sm:items-end gap-0.5">
          <a href="mailto:wbi@bwh.harvard.edu" className="link-accent">
            wbi@bwh.harvard.edu
          </a>
          <span>617-525-8319</span>
        </div>
      </div>
    </footer>
  );
}
