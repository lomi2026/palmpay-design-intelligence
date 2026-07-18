import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PalmPay体验设计Hub',
  description: 'PalmPay Design Intelligence Hub',
};

const themeBootstrap = `(()=>{try{const current=localStorage.getItem('ppux-theme');const legacy=localStorage.getItem('pp-theme');const parsed=legacy?JSON.parse(legacy):null;const theme=current==='light'||current==='dark'?current:parsed==='light'?'light':'dark';document.documentElement.classList.toggle('dark',theme==='dark');document.documentElement.style.colorScheme=theme}catch{document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark'}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
