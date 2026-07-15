import { useEffect, useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';
import { AppLayout } from '../components/AppLayout';
import { CustomModal } from '../components/CustomModal';
import { GradientButton } from '../components/GradientButton';
import { formatCurrency } from '../utils/formatereal';
import type { IServico } from '../types';

const emptyServico = (): Omit<IServico, 'id'> => ({
  descricao: '', valor: 0, valor_promocao: 0,
  ativo: true, promocao_ativo: false, empresaId: 0,
});

export function ServicosPage() {
  const { user } = useAuth();
  const { notify } = useNotif();
  const [servicos, setServicos] = useState<IServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'novo' | 'editar' | null>(null);
  const [form, setForm] = useState<Omit<IServico, 'id'>>(emptyServico());
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      setServicos(await api.getServicos(user.empresaId));
    } catch {
      notify('Erro ao carregar serviços', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openNovo() {
    setForm({ ...emptyServico(), empresaId: user!.empresaId });
    setEditId(null); setModal('novo');
  }

  function openEditar(s: IServico) {
    setForm({ descricao: s.descricao, valor: s.valor, valor_promocao: s.valor_promocao, ativo: s.ativo, promocao_ativo: s.promocao_ativo, empresaId: s.empresaId });
    setEditId(s.id); setModal('editar'); setConfirmDelete(false);
  }

  async function handleSalvar() {
    if (!form.descricao.trim()) { notify('Informe o nome do serviço', 'warning'); return; }
    setSubmitting(true);
    try {
      if (modal === 'novo') {
        await api.criarServico(form);
        notify('Serviço criado!', 'success');
      } else {
        await api.editarServico(editId!, form);
        notify('Serviço atualizado!', 'success');
      }
      setModal(null); load();
    } catch {
      notify('Erro ao salvar serviço', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExcluir() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setSubmitting(true);
    try {
      await api.excluirServico(editId!);
      notify('Serviço excluído!', 'success');
      setModal(null); load();
    } catch {
      notify('Erro ao excluir serviço', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function set(key: keyof typeof form, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <AppLayout>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--dark1)', marginBottom: 20 }}>Serviços</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--dark2)' }}>Carregando...</div>
      ) : servicos.length === 0 ? (
        <p style={{ color: 'var(--dark2)', fontSize: 14 }}>Nenhum serviço cadastrado.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {servicos.map((s) => (
            <div key={s.id} onClick={() => openEditar(s)} style={{
              background: '#fff', borderRadius: 14, padding: '14px 16px',
              boxShadow: '0 2px 10px var(--shadow)', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              opacity: s.ativo ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Tag size={18} color="var(--grad-end)" />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{s.descricao}</p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                    {!s.ativo && <span style={{ fontSize: 11, background: '#eee', padding: '2px 8px', borderRadius: 10, color: 'var(--dark2)' }}>Inativo</span>}
                    {s.promocao_ativo && <span style={{ fontSize: 11, background: '#FFF3CD', padding: '2px 8px', borderRadius: 10, color: '#856404' }}>Promoção</span>}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {s.promocao_ativo ? (
                  <>
                    <p style={{ fontSize: 12, color: 'var(--dark2)', textDecoration: 'line-through' }}>{formatCurrency(s.valor)}</p>
                    <p style={{ fontWeight: 700, color: 'var(--grad-end)' }}>{formatCurrency(s.valor_promocao)}</p>
                  </>
                ) : (
                  <p style={{ fontWeight: 700, color: 'var(--grad-end)' }}>{formatCurrency(s.valor)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={openNovo} style={{
        position: 'fixed', bottom: 80, right: 20, width: 56, height: 56, borderRadius: '50%',
        background: 'linear-gradient(135deg, #D4A5A5, #C4855A)', border: 'none',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(196,133,90,0.4)', cursor: 'pointer', zIndex: 50,
      }}>
        <Plus size={26} />
      </button>

      {modal && (
        <CustomModal
          title={modal === 'novo' ? 'Novo Serviço' : 'Editar Serviço'}
          onClose={() => setModal(null)}
          footer={
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              {modal === 'editar' && (
                <GradientButton variant="danger" onClick={handleExcluir} loading={submitting} style={{ flex: 1 }}>
                  {confirmDelete ? 'Confirmar exclusão' : 'Excluir'}
                </GradientButton>
              )}
              <GradientButton onClick={handleSalvar} loading={submitting} style={{ flex: 1 }}>Salvar</GradientButton>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Nome do serviço</label>
              <input
                style={{ ...inputStyle, background: modal === 'editar' ? '#f5f5f5' : '#fff' }}
                value={form.descricao}
                onChange={(e) => set('descricao', e.target.value)}
                readOnly={modal === 'editar'}
                placeholder="Ex: Corte feminino"
              />
            </div>
            <div>
              <label style={labelStyle}>Valor (R$)</label>
              <input style={inputStyle} type="number" min={0} step={0.01} value={form.valor} onChange={(e) => set('valor', Number(e.target.value))} />
            </div>
            <Toggle label="Serviço ativo" value={form.ativo} onChange={(v) => set('ativo', v)} />
            <Toggle label="Promoção ativa" value={form.promocao_ativo} onChange={(v) => set('promocao_ativo', v)} />
            {form.promocao_ativo && (
              <div>
                <label style={labelStyle}>Valor promocional (R$)</label>
                <input style={inputStyle} type="number" min={0} step={0.01} value={form.valor_promocao} onChange={(e) => set('valor_promocao', Number(e.target.value))} />
              </div>
            )}
          </div>
        </CustomModal>
      )}
    </AppLayout>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark1)' }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: value ? 'var(--accent1)' : '#ccc', position: 'relative', transition: 'background .2s',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: value ? 22 : 2, width: 20, height: 20,
          borderRadius: '50%', background: '#fff', transition: 'left .2s',
        }} />
      </button>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--dark1)', display: 'block', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #ddd', fontSize: 15, outline: 'none', boxSizing: 'border-box' };
