import { CONTACT } from "@/lib/content";

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <h1 className="text-display">Contact</h1>
      <div className="panel p-6 space-y-4">
        <div>
          <div className="field-label">Address</div>
          <div>{CONTACT.labName}</div>
          <div>{CONTACT.address}</div>
        </div>
        <div>
          <div className="field-label">Phone</div>
          {CONTACT.phones.map((p) => (
            <div key={p}>{p}</div>
          ))}
        </div>
        <div>
          <div className="field-label">Email</div>
          <a href={`mailto:${CONTACT.email}`} className="link-accent">
            {CONTACT.email}
          </a>
        </div>
      </div>
    </div>
  );
}
