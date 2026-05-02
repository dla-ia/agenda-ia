import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/svg+xml';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 14,
          background: '#C26A4A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
          <path
            d="M50 22 C50 14, 42 8, 32 8 C18 8, 8 18, 8 32 C8 46, 18 56, 32 56 C42 56, 50 50, 53 42"
            stroke="#FBF7F1"
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="50" cy="22" r="4.2" fill="#FBF7F1" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
