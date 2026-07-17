import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { TooltipProvider } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: 'PalmPay体验设计Hub',
  description: 'PalmPay Design Intelligence Hub',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="dark">
      <body suppressHydrationWarning>
        <TooltipProvider>
          <Providers>{children}</Providers>
        </TooltipProvider>
      </body>
    </html>
  );
}
