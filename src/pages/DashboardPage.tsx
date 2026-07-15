import { useEffect, useState } from 'react';
import { CalendarCheck, TrendingUp, CheckCircle, DollarSign, RefreshCw } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/AppLayout';
import { KPICard } from '../components/KPICard';
import { AtendimentoCard } from '../components/AtendimentoCard';
import { formatCurrency } from '../utils/formatereal';
import type { IAtendimento } from '../types';

type Periodo = 'DIA' | 'SEMANA' | 'MES';

export interface TotalizadoresInterface {
  atendimentos: number,
  emAndamento: number,
  finalizados: number,
  faturamento: number
}

function getPeriodoDates(p: Periodo): { de: string; ate: string } {
  const now = new Date();
  const ate = now.toISOString().slice(0, 10);
  if (p === 'DIA') return { de: ate, ate };
  if (p === 'SEMANA') {
    const d = new Date(now); d.setDate(d.getDate() - 7);
    return { de: d.toISOString().slice(0, 10), ate };
  }
  const d = new Date(now); d.setDate(1);
  return { de: d.toISOString().slice(0, 10), ate };
}

export function DashboardPage() {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState<Periodo>('DIA');
  const [atendimentos, setAtendimentos] = useState<IAtendimento[]>([]);
  const [totalizadores, setTotalizadores] = useState<TotalizadoresInterface>();
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const { de, ate } = getPeriodoDates(periodo);
      const atendimentosData = await api.getAtendimentosPorPeriodo(user.empresaId, de, ate);
      const totalizadoresData = await api.getTotalizadores(user.empresaId, periodo)

      setAtendimentos(atendimentosData);
      setTotalizadores(totalizadoresData);
    } catch {
      setAtendimentos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [periodo]);

  const ultimos = [...atendimentos].sort((a, b) => (b.dataCriacao ?? '').localeCompare(a.dataCriacao ?? '')).slice(0, 6);

  return (
    <AppLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--dark1)' }}>Dashboard</h1>
        <button onClick={load} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dark2)' }}>
          <RefreshCw size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['DIA', 'SEMANA', 'MES'] as Periodo[]).map((p) => (
          <button key={p} onClick={() => setPeriodo(p)} style={{
            padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: periodo === p ? 'linear-gradient(135deg, #D4A5A5, #C4855A)' : '#fff',
            color: periodo === p ? '#fff' : 'var(--dark2)',
            boxShadow: '0 1px 4px var(--shadow)',
          }}>
            {p === 'DIA' ? 'Hoje' : p === 'SEMANA' ? 'Semana' : 'Mês'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--dark2)' }}>Carregando...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <KPICard title="Total" value={totalizadores.atendimentos} icon={<CalendarCheck size={22} />} />
            <KPICard title="Em Andamento" value={totalizadores.emAndamento} icon={<TrendingUp size={22} />} accent="var(--accent1)" />
            <KPICard title="Finalizados" value={totalizadores.finalizados} icon={<CheckCircle size={22} />} />
            <KPICard title="Faturamento" value={formatCurrency(totalizadores.faturamento)} icon={<DollarSign size={22} />} accent="var(--accent2)" />
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--dark1)', marginBottom: 12 }}>Últimos atendimentos</h2>
          {ultimos.length === 0 ? (
            <p style={{ color: 'var(--dark2)', fontSize: 14 }}>Nenhum atendimento no período.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ultimos.map((a) => <AtendimentoCard key={a.id} atendimento={a} />)}
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
