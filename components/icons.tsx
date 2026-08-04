// Shared icon glyphs used in more than one place (Header utility bar, Footer
// contact block, Contact page icon row) with different sizes/colors --
// extracted here so the path data has one source instead of three.

interface IconProps {
  size?: number;
  color?: string;
}

export function PhoneIcon({ size = 12, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.3 11.3 0 003.55.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.3 11.3 0 00.57 3.55 1 1 0 01-.25 1.01l-2.2 2.23z" />
    </svg>
  );
}

export function MailIcon({ size = 12, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

export function FaxIcon({ size = 13, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" aria-hidden="true">
      <path d="M6 3h9l3 3v4H6z" />
      <path d="M6 10H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
      <path d="M18 10h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2" />
      <rect x="6" y="14" width="12" height="7" />
    </svg>
  );
}
