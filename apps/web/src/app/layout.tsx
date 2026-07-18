import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PalmPay体验设计Hub',
  description: 'PalmPay Design Intelligence Hub',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="dark">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
