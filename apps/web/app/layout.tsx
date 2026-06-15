import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Open Coach',
  description: 'Plataforma de gestión para entrenadores personales',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>{children}</body>
    </html>
  );
}
