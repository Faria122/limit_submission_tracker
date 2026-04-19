/**import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Providers from './providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Submission Tracker',
  description: 'Operations dashboard for reviewing broker-submitted opportunities',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}**/
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Providers from './providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Apollo | Submission Tracker',
  description: 'Operations workspace for reviewing broker-submitted opportunities',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <TopNav />
          <main style={{ flex: 1 }}>{children}</main>
        </Providers>
      </body>
    </html>
  );
}

function TopNav() {
  return (
    <header
      style={{
        height: 52,
        borderBottom: '1px solid #e8eaf0',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Left: wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Logo mark — two overlapping circles like a Venn diagram / deal flow symbol */}
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="10" fill="#0f62fe" fillOpacity="0.9" />
          <circle cx="18" cy="10" r="10" fill="#0f62fe" fillOpacity="0.4" />
        </svg>
        <span
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: '#0a0f1e',
            fontFamily: 'var(--font-geist-sans)',
          }}
        >
          Apollo
        </span>
        {/* Divider */}
        <span style={{ color: '#d0d5e0', fontSize: '1rem', marginLeft: 2 }}>|</span>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 500,
            color: '#6b7280',
            letterSpacing: '0.01em',
            fontFamily: 'var(--font-geist-sans)',
          }}
        >
          Submissions
        </span>
      </div>

      {/* Right: environment badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: '#f0f4ff',
          border: '1px solid #c7d4fc',
          borderRadius: 20,
          padding: '3px 10px',
        }}
      >
        {/* Pulsing green dot */}
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            display: 'inline-block',
            flexShrink: 0,
            boxShadow: '0 0 0 2px #bbf7d0',
          }}
        />
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#3b5bdb',
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-geist-sans)',
            textTransform: 'uppercase',
          }}
        >
          Ops Dashboard
        </span>
      </div>
    </header>
  );
}