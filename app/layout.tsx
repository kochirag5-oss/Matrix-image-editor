import type { Metadata } from 'next';
import { Space_Grotesk, Inter, Orbitron } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nebula — Holographic Image Editor',
  description:
    'Transform your images with cinematic filters, color grading, text layers, and lossless export. A holographic editing experience.',
  keywords: ['image editor', 'filters', 'photo editing', 'color grading', 'nebula'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${orbitron.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
