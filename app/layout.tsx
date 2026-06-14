import '../styles/globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import SessionProvider from '../components/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DDDCCBL Employee Dashboard',
  description: 'Employee dashboard with role-based menus and reports',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
