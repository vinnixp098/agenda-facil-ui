import type { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
  accent?: string;
}

export function KPICard({ title, value, icon, accent = 'var(--grad-end)' }: Props) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '18px 20px',
      boxShadow: '0 2px 12px var(--shadow)', display: 'flex',
      alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `linear-gradient(135deg, var(--grad-start), ${accent})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 12, color: 'var(--dark2)', marginBottom: 2 }}>{title}</p>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--dark1)' }}>{value}</p>
      </div>
    </div>
  );
}
