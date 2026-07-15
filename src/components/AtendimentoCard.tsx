import type { IAtendimento } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatCurrency } from '../utils/formatereal';

interface Props {
  atendimento: IAtendimento;
  onClick?: () => void;
}

export function AtendimentoCard({ atendimento, onClick }: Props) {
  const servicos = atendimento.servicos ?? [];
  const nomes = servicos.map((s) => s.servicoDescricao).join(', ') || '—';

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: 14, padding: '16px 18px',
        boxShadow: '0 2px 10px var(--shadow)', cursor: onClick ? 'pointer' : 'default',
        display: 'flex', flexDirection: 'column', gap: 8,
        transition: 'transform .15s',
      }}
      onMouseEnter={(e) => { if (onClick) (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--dark1)' }}>{atendimento.cliente}</p>
          <p style={{ fontSize: 12, color: 'var(--dark2)', marginTop: 2 }}>{atendimento.telefone}</p>
        </div>
        <StatusBadge status={atendimento.status} />
      </div>
      <p style={{ fontSize: 13, color: 'var(--dark2)' }}>{nomes}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--dark2)' }}>
          {atendimento.data_agendamento
            ? new Date(atendimento.data_agendamento).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
            : '—'}
        </span>
        <span style={{ fontWeight: 700, color: 'var(--grad-end)', fontSize: 15 }}>
          {formatCurrency(atendimento.valor_total)}
        </span>
      </div>
    </div>
  );
}
