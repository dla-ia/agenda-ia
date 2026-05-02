import { Isotype } from './Isotype';
import { Wordmark } from './Wordmark';

export function Lockup({
  size = 36,
  color = '#2C241D',
  markColor = '#C26A4A',
  gap = 12,
  className,
}: {
  size?: number;
  color?: string;
  markColor?: string;
  gap?: number;
  className?: string;
}) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap }} className={className}>
      <Isotype size={Math.round(size * 1.05)} color={markColor} />
      <Wordmark size={size} color={color} />
    </div>
  );
}
