export function Wordmark({
  size = 56,
  color = '#2C241D',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-serif)',
        fontWeight: 500,
        fontSize: size,
        letterSpacing: '-0.035em',
        color,
        lineHeight: 1,
        fontVariationSettings: '"opsz" 144',
      }}
    >
      calendaria
    </span>
  );
}
