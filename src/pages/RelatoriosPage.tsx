import { useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';
import { AppLayout } from '../components/AppLayout';
import { KPICard } from '../components/KPICard';
import { AtendimentoCard } from '../components/AtendimentoCard';
import { StatusBadge } from '../components/StatusBadge';
import { CustomModal } from '../components/CustomModal';
import { GradientButton } from '../components/GradientButton';
import { formatCurrency } from '../utils/formatereal';
import type { IAtendimento, AtendimentoStatus } from '../types';
import { CalendarCheck, DollarSign } from 'lucide-react';

type FiltroStatus = 'TODOS' | AtendimentoStatus;

export function RelatoriosPage() {
  const { user } = useAuth();
  const { notify } = useNotif();
  const hoje = new Date().toISOString().slice(0, 10);
  const [de, setDe] = useState(hoje);
  const [ate, setAte] = useState(hoje);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('TODOS');
  const [atendimentos, setAtendimentos] = useState<IAtendimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscou, setBuscou] = useState(false);
  const [detalhe, setDetalhe] = useState<IAtendimento | null>(null);

  async function buscar() {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getAtendimentosPorPeriodo(user.empresaId, de, ate, filtroStatus);
      const sorted = [...data].sort((a, b) => (b.dataCriacao ?? '').localeCompare(a.dataCriacao ?? '')).slice(0, 12);
      setAtendimentos(sorted);
      setBuscou(true);
    } catch {
      notify('Erro ao buscar relatório', 'error');
    } finally {
      setLoading(false);
    }
  }

  const total = atendimentos.length;
  const faturamento = atendimentos.filter((a) => a.status === 'FINALIZADO').reduce((s, a) => s + a.valor_total, 0);

  return (
    <AppLayout>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--dark1)', marginBottom: 20 }}>Relatórios</h1>

      <div style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, boxShadow: '0 2px 10px var(--shadow)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>De</label>
            <input style={inputStyle} type="date" value={de} onChange={(e) => setDe(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Até</label>
            <input style={inputStyle} type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select style={inputStyle} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}>
            <option value="TODOS">Todos</option>
            <option value="AGENDADO">Agendado</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
        <GradientButton onClick={buscar} loading={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Search size={16} /> Buscar
        </GradientButton>
      </div>

      {buscou && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <KPICard title="Total no período" value={total} icon={<CalendarCheck size={22} />} />
            <KPICard title="Faturamento" value={formatCurrency(faturamento)} icon={<DollarSign size={22} />} accent="var(--accent2)" />
          </div>

          {atendimentos.length === 0 ? (
            <p style={{ color: 'var(--dark2)', fontSize: 14 }}>Nenhum atendimento encontrado.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {atendimentos.map((a) => <AtendimentoCard key={a.id} atendimento={a} onClick={() => setDetalhe(a)} />)}
            </div>
          )}
        </>
      )}

      {detalhe && (
        <CustomModal title="Detalhes do Atendimento" onClose={() => setDetalhe(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 17 }}>{detalhe.cliente}</p>
                <p style={{ color: 'var(--dark2)', fontSize: 13 }}>{detalhe.telefone}</p>
              </div>
              <StatusBadge status={detalhe.status} />
            </div>
            {(detalhe.servicos ?? []).map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span>{s.servicoDescricao} {s.usuarioNome ? `(${s.usuarioNome})` : ''}</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(s.valorTotal)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, borderTop: '1px solid #eee', paddingTop: 8 }}>
              <span>Total</span>
              <span style={{ color: 'var(--grad-end)' }}>{formatCurrency(detalhe.valor_total)}</span>
            </div>
          </div>
        </CustomModal>
      )}
    </AppLayout>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--dark1)', display: 'block', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #ddd', fontSize: 14, outline: 'none', boxSizing: 'border-box' };
