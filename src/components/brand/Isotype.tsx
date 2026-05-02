export function Isotype({
  size = 64,
  color = '#C26A4A',
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-label="Calendaria"
    >
      <path
        d="M50 22 C50 14, 42 8, 32 8 C18 8, 8 18, 8 32 C8 46, 18 56, 32 56 C42 56, 50 50, 53 42"
        stroke={color}
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="50" cy="22" r="4.2" fill={color} />
    </svg>
  );
}
