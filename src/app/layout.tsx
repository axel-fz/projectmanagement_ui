import type { Metadata } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'NexaFlow - Modern Project Management Dashboard',
  description:
    'A high-performance modern project management dashboard with cyber-space glassmorphism, instant theme switching, and local-first persistence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Anti-flicker zero-latency theme initialization script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('nexaflow-theme');
                if (storedTheme) {
                  const parsed = JSON.parse(storedTheme);
                  if (parsed && parsed.state && parsed.state.theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased selection:bg-[var(--primary)] selection:text-white">
        {children}
      </body>
    </html>
  );
}
