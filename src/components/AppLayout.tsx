import type { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Header />
      <main style={{ flex: 1, padding: '20px 16px 90px', maxWidth: 700, width: '100%', margin: '0 auto' }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
