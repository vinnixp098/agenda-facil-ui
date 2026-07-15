import { useEffect, useState } from 'react';
import { Plus, MessageCircle } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';
import { AppLayout } from '../components/AppLayout';
import { AtendimentoCard } from '../components/AtendimentoCard';
import { StatusBadge } from '../components/StatusBadge';
import { CustomModal } from '../components/CustomModal';
import { GradientButton } from '../components/GradientButton';
import { formatCurrency } from '../utils/formatereal';
import { formatPhone } from '../utils/formatPhone';
import type { IAtendimento, IServico, IUsuario, IDisponibilidade, AtendimentoStatus } from '../types';
import { isHorarioPassado } from '../mock/horarios';
import { CalendarioSelector } from '../components/CalendarioSelector';

type FiltroStatus = 'TODOS' | 'EM_ANDAMENTO' | 'AGENDADO';
type WizardStep = 1 | 2 | 3 | 4;

interface ServicoSel { servicoId: number; usuarioId: number | null; }

const HORARIOS = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'];

export function AtendimentosPage() {
  const { user } = useAuth();
  const { notify } = useNotif();
  const [atendimentos, setAtendimentos] = useState<IAtendimento[]>([]);
  const [servicos, setServicos] = useState<IServico[]>([]);
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [disponibilidade, setDisponibilidade] = useState<IDisponibilidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<FiltroStatus>('TODOS');
  const [showNovo, setShowNovo] = useState(false);
  const [detalhe, setDetalhe] = useState<IAtendimento | null>(null);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [submitting, setSubmitting] = useState(false);

  // Wizard state
  const [cliente, setCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [selecionados, setSelecionados] = useState<ServicoSel[]>([]);
  const [statusNovo, setStatusNovo] = useState<'EM_ANDAMENTO' | 'AGENDADO'>('AGENDADO');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const [a, s, u, d] = await Promise.all([
        api.getAtendimentos(user.empresaId, filtro),
        api.getServicos(user.empresaId),
        api.getUsuarios(user.empresaId),
        api.getDisponibilidade(user.empresaId),
      ]);
      setAtendimentos(a); setServicos(s); setUsuarios(u); setDisponibilidade(d);
    } catch {
      notify('Erro ao carregar atendimentos', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filtro]);

  function resetWizard() {
    setCliente(''); setTelefone(''); setSelecionados([]);
    setStatusNovo('AGENDADO'); setData(''); setHora('');
    setWizardStep(1);
  }

  function openNovo() { resetWizard(); setShowNovo(true); }

  function toggleServico(id: number) {
    setSelecionados((prev) => prev.find((s) => s.servicoId === id)
      ? prev.filter((s) => s.servicoId !== id)
      : [...prev, { servicoId: id, usuarioId: null }]);
  }

  function setUsuarioServico(servicoId: number, usuarioId: number) {
    setSelecionados((prev) => prev.map((s) => s.servicoId === servicoId ? { ...s, usuarioId } : s));
  }

  function horariosDisponiveis(d: string) {
    const dia = disponibilidade.find((x) => x.data === d);
    const base = dia ? dia.horariosDisponiveis.map((h) => h.slice(0, 5)) : HORARIOS;
    return base.filter((h) => !isHorarioPassado(d, h));
  }

  function diasDisponiveis() { return disponibilidade.map((d) => d.data); }

  async function handleConfirmar() {
    if (!user) return;
    setSubmitting(true);
    try {
      const total = selecionados.reduce((acc, sel) => {
        const s = servicos.find((x) => x.id === sel.servicoId);
        return acc + (s ? (s.promocao_ativo ? s.valor_promocao : s.valor) : 0);
      }, 0);

      const atend = await api.criarAtendimento({
        cliente, telefone: telefone.replace(/\D/g, ''),
        empresaId: user.empresaId, status: statusNovo,
        data_agendamento: statusNovo === 'AGENDADO' ? `${data}T${hora}` : new Date().toISOString(),
        valor_total: total,
      });

      await Promise.all(selecionados.map((sel) => {
        const s = servicos.find((x) => x.id === sel.servicoId)!;
        const u = usuarios.find((x) => x.id === sel.usuarioId);
        return api.associarServico({
          atendimentoId: atend.id, servicoId: s.id, servicoDescricao: s.descricao,
          valorTotal: s.promocao_ativo ? s.valor_promocao : s.valor,
          empresaId: user.empresaId, usuarioId: sel.usuarioId ?? null,
          usuarioNome: u?.nome ?? '',
        });
      }));

      notify('Atendimento criado com sucesso!', 'success');
      setShowNovo(false);
      load();
    } catch {
      notify('Erro ao criar atendimento', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAtualizarStatus(id: number, status: AtendimentoStatus) {
    try {
      await api.atualizarStatus(id, status);
      notify('Status atualizado!', 'success');
      setDetalhe(null);
      load();
    } catch {
      notify('Erro ao atualizar status', 'error');
    }
  }

  const filtrados = atendimentos.filter((a) => filtro === 'TODOS' || a.status === filtro);
  const hoje = new Date().toISOString().slice(0, 10);
  const maxData = diasDisponiveis().at(-1) ?? hoje;
  const totalWizard = selecionados.reduce((acc, sel) => {
    const s = servicos.find((x) => x.id === sel.servicoId);
    return acc + (s ? (s.promocao_ativo ? s.valor_promocao : s.valor) : 0);
  }, 0);

  return (
    <AppLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--dark1)' }}>Atendimentos</h1>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['TODOS', 'EM_ANDAMENTO', 'AGENDADO'] as FiltroStatus[]).map((f) => (
          <button key={f} onClick={() => setFiltro(f)} style={{
            padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: filtro === f ? 'linear-gradient(135deg, #D4A5A5, #C4855A)' : '#fff',
            color: filtro === f ? '#fff' : 'var(--dark2)',
            boxShadow: '0 1px 4px var(--shadow)',
          }}>
            {f === 'TODOS' ? 'Todos' : f === 'EM_ANDAMENTO' ? 'Em Andamento' : 'Agendado'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--dark2)' }}>Carregando...</div>
      ) : filtrados.length === 0 ? (
        <p style={{ color: 'var(--dark2)', fontSize: 14 }}>Nenhum atendimento encontrado.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtrados.map((a) => <AtendimentoCard key={a.id} atendimento={a} onClick={() => setDetalhe(a)} />)}
        </div>
      )}

      {/* FAB */}
      <button onClick={openNovo} style={{
        position: 'fixed', bottom: 80, right: 20, width: 56, height: 56, borderRadius: '50%',
        background: 'linear-gradient(135deg, #D4A5A5, #C4855A)', border: 'none',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(196,133,90,0.4)', cursor: 'pointer', zIndex: 50,
      }}>
        <Plus size={26} />
      </button>

      {/* Modal Novo Atendimento */}
      {showNovo && (
        <CustomModal
          title={`Novo Atendimento — Etapa ${wizardStep} de ${statusNovo === 'AGENDADO' ? 4 : 3}`}
          onClose={() => setShowNovo(false)}
          footer={
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              {wizardStep > 1 && <GradientButton variant="ghost" onClick={() => setWizardStep((s) => (s - 1) as WizardStep)} style={{ flex: 1 }}>Voltar</GradientButton>}
              {wizardStep < (statusNovo === 'AGENDADO' ? 4 : 3) ? (
                <GradientButton onClick={() => {
                  if (wizardStep === 1 && !cliente.trim()) { notify('Informe o nome do cliente', 'warning'); return; }
                  if (wizardStep === 2 && selecionados.length === 0) { notify('Selecione ao menos um serviço', 'warning'); return; }
                  if (wizardStep === 3 && statusNovo === 'AGENDADO' && !data) { notify('Selecione uma data', 'warning'); return; }
                  setWizardStep((s) => (s + 1) as WizardStep);
                }} style={{ flex: 1 }}>Próximo</GradientButton>
              ) : (
                <GradientButton onClick={handleConfirmar} loading={submitting} style={{ flex: 1 }}>Confirmar</GradientButton>
              )}
            </div>
          }
        >
          {wizardStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Nome do cliente</label>
                <input style={inputStyle} value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Ex: Maria Silva" />
              </div>
              <div>
                <label style={labelStyle}>Telefone</label>
                <input style={inputStyle} type="tel" value={formatPhone(telefone)} onChange={(e) => setTelefone(e.target.value)} placeholder="(98) 99999-9999" />
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Status</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['EM_ANDAMENTO', 'AGENDADO'] as const).map((s) => (
                    <button key={s} onClick={() => setStatusNovo(s)} style={{
                      flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                      background: statusNovo === s ? 'linear-gradient(135deg, #D4A5A5, #C4855A)' : '#f0f0f0',
                      color: statusNovo === s ? '#fff' : 'var(--dark2)',
                    }}>
                      {s === 'EM_ANDAMENTO' ? 'Em Andamento' : 'Agendado'}
                    </button>
                  ))}
                </div>
              </div>
              <label style={labelStyle}>Serviços</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {servicos.filter((s) => s.ativo).map((s) => {
                  const sel = selecionados.find((x) => x.servicoId === s.id);
                  return (
                    <div key={s.id} style={{ border: `2px solid ${sel ? 'var(--grad-end)' : '#eee'}`, borderRadius: 10, padding: 12, cursor: 'pointer' }} onClick={() => toggleServico(s.id)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{s.descricao}</span>
                        <span style={{ color: 'var(--grad-end)', fontWeight: 700 }}>{formatCurrency(s.promocao_ativo ? s.valor_promocao : s.valor)}</span>
                      </div>
                      {sel && (
                        <div style={{ marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
                          <p style={{ fontSize: 12, color: 'var(--dark2)', marginBottom: 6 }}>Profissional:</p>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {usuarios.map((u) => (
                              <button key={u.id} onClick={() => setUsuarioServico(s.id, u.id)} style={{
                                padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                background: sel.usuarioId === u.id ? 'var(--accent1)' : '#f0f0f0',
                                color: sel.usuarioId === u.id ? '#fff' : 'var(--dark2)',
                              }}>{u.nome}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {selecionados.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #eee', fontWeight: 700 }}>
                  <span>{selecionados.length} serviço(s)</span>
                  <span style={{ color: 'var(--grad-end)' }}>{formatCurrency(totalWizard)}</span>
                </div>
              )}
            </div>
          )}

          {wizardStep === 3 && statusNovo === 'AGENDADO' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={labelStyle}>Data</label>
              <CalendarioSelector value={data} onChange={(d) => { setData(d); setHora(horariosDisponiveis(d)[0] ?? ''); }} minData={hoje} maxData={maxData} datasDisponiveis={diasDisponiveis()} />
              {data && (
                <>
                  <label style={labelStyle}>Horário</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {horariosDisponiveis(data).map((h) => (
                      <button key={h} onClick={() => setHora(h)} style={{
                        padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
                        background: hora === h ? 'linear-gradient(135deg, #D4A5A5, #C4855A)' : '#f0f0f0',
                        color: hora === h ? '#fff' : 'var(--dark2)',
                      }}>{h}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {((wizardStep === 3 && statusNovo === 'EM_ANDAMENTO') || wizardStep === 4) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h3 style={{ fontWeight: 700, color: 'var(--dark1)', marginBottom: 4 }}>Resumo</h3>
              <Row label="Cliente" value={cliente} />
              <Row label="Telefone" value={formatPhone(telefone)} />
              <Row label="Status" value={statusNovo === 'EM_ANDAMENTO' ? 'Em Andamento' : 'Agendado'} />
              {statusNovo === 'AGENDADO' && <Row label="Data/Hora" value={`${data} às ${hora}`} />}
              <div style={{ borderTop: '1px solid #eee', paddingTop: 10, marginTop: 4 }}>
                {selecionados.map((sel) => {
                  const s = servicos.find((x) => x.id === sel.servicoId)!;
                  const u = usuarios.find((x) => x.id === sel.usuarioId);
                  return (
                    <div key={sel.servicoId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                      <span>{s?.descricao} {u ? `(${u.nome})` : ''}</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(s?.promocao_ativo ? s.valor_promocao : s.valor)}</span>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, borderTop: '1px solid #eee', paddingTop: 8 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--grad-end)' }}>{formatCurrency(totalWizard)}</span>
                </div>
              </div>
            </div>
          )}
        </CustomModal>
      )}

      {/* Modal Detalhes */}
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

            {detalhe.data_agendamento && (
              <Row label="Agendado para" value={new Date(detalhe.data_agendamento).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} />
            )}
            {detalhe.dataCriacao && (
              <Row label="Criado em" value={new Date(detalhe.dataCriacao).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} />
            )}

            {(detalhe.servicos ?? []).length > 0 && (
              <div style={{ borderTop: '1px solid #eee', paddingTop: 10 }}>
                {detalhe.servicos.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                    <span>{s.servicoDescricao} {s.usuarioNome ? `(${s.usuarioNome})` : ''}</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(s.valorTotal)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, borderTop: '1px solid #eee', paddingTop: 8 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--grad-end)' }}>{formatCurrency(detalhe.valor_total)}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {detalhe.status === 'EM_ANDAMENTO' && (
                <GradientButton onClick={() => handleAtualizarStatus(detalhe.id!, 'FINALIZADO')} style={{ width: '100%' }}>
                  Finalizar Atendimento
                </GradientButton>
              )}
              {detalhe.status === 'AGENDADO' && (
                <>
                  <GradientButton onClick={() => handleAtualizarStatus(detalhe.id!, 'EM_ANDAMENTO')} style={{ width: '100%' }}>
                    Iniciar Atendimento
                  </GradientButton>
                  <GradientButton variant="danger" onClick={() => handleAtualizarStatus(detalhe.id!, 'CANCELADO')} style={{ width: '100%' }}>
                    Cancelar
                  </GradientButton>
                  <a
                    href={`https://wa.me/55${detalhe.telefone.replace(/\D/g, '')}?text=Olá ${detalhe.cliente}, confirmando seu agendamento!`}
                    target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 10, background: '#25D366', color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}
                  >
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                </>
              )}
            </div>
          </div>
        </CustomModal>
      )}
    </AppLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
      <span style={{ color: 'var(--dark2)' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--dark1)', display: 'block', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #ddd', fontSize: 15, outline: 'none', boxSizing: 'border-box' };
