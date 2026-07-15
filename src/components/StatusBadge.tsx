import type { AtendimentoStatus } from '../types';

const config: Record<AtendimentoStatus, { label: string; color: string; bg: string }> = {
  EM_ANDAMENTO: { label: 'Em Andamento', color: '#fff', bg: '#7A9E87' },
  AGENDADO:     { label: 'Agendado',     color: '#fff', bg: '#C9A84C' },
  FINALIZADO:   { label: 'Finalizado',   color: '#fff', bg: '#C4855A' },
  CANCELADO:    { label: 'Cancelado',    color: '#fff', bg: '#C0392B' },
};

export function StatusBadge({ status }: { status: AtendimentoStatus }) {
  const c = config[status] ?? config.AGENDADO;
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {c.label}
    </span>
  );
}
