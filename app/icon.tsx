import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#d94b10',
        }}
      >
        <svg width="320" height="320" viewBox="0 0 14 14" fill="none">
          <path d="M4 1.5v11" stroke="#261003" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4 2h7l-2.2 2.5L11 7H4z" fill="#261003" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
