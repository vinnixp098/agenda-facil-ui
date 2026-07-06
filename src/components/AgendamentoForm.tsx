import { useEffect, useState } from 'react';
import { api } from '../api';
// import type { IServico, IServicoSelecionado, IUsuario } from '../types';
import type { IServico, IUsuario } from '../types';
import { Field } from './Field';
import { CalendarioSelector } from './CalendarioSelector';
import {
  HORARIOS_DISPONIVEIS,
  horariosOcupadosNoDia,
  isDiaLotado,
  isHorarioPassado,
  primeiroHorarioLivre,
} from '../mock/horarios';
import styles from './AgendamentoForm.module.css';
import { formatCurrency } from '../utils/formatereal';
import { formatPhone } from '../utils/formatPhone';

interface FormData {
  cliente: string;
  telefone: string;
  data: string;
  hora: string;
}

interface Errors {
  cliente?: string;
  telefone?: string;
  data?: string;
  hora?: string;
  // servicos?: string;
}

interface Props {
  empresaId: number;
  onSuccess: () => void;
}

function valorServico(s: IServico) {
  return s.promocao_ativo ? s.valor_promocao : s.valor;
}

function hojeStr() {
  return new Date().toISOString().slice(0, 10);
}

function maxDataStr() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export function AgendamentoForm({ empresaId, onSuccess }: Props) {
  const [servicos, setServicos] = useState<IServico[]>([]);
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const [form, setForm] = useState<FormData>({
    cliente: '',
    telefone: '',
    data: '',
    hora: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  // const [selecionados, setSelecionados] = useState<IServicoSelecionado[]>([]);

  useEffect(() => {
    Promise.all([api.getServicos(empresaId), api.getUsuarios(empresaId)])
      .then(([s, u]) => { setServicos(s); setUsuarios(u); })
      .catch(() => setApiError('Erro ao carregar dados. Tente novamente.'))
      .finally(() => setLoading(false));
  }, []);

  // function toggleServico(servicoId: number) {
  //   setSelecionados((prev) => {
  //     const existe = prev.find((s) => s.servicoId === servicoId);
  //     if (existe) return prev.filter((s) => s.servicoId !== servicoId);
  //     return [...prev, { servicoId, usuarioId: null }];
  //   });
  //   setErrors((prev) => ({ ...prev, servicos: undefined }));
  // }

  // function setUsuarioDoServico(servicoId: number, usuarioId: number) {
  //   setSelecionados((prev) =>
  //     prev.map((s) => s.servicoId === servicoId ? { ...s, usuarioId } : s)
  //   );
  // }

  function validate(): boolean {
    const e: Errors = {};
    if (!form.cliente.trim()) e.cliente = 'Informe o seu nome';
    if (!form.telefone.trim()) e.telefone = 'Informe o seu telefone';
    if (!form.data) e.data = 'Escolha uma data';
    else if (isDiaLotado(form.data)) e.data = 'Este dia não tem mais horários disponíveis';
    if (!form.hora) e.hora = 'Escolha um horário';
    // if (selecionados.length === 0) e.servicos = 'Escolha ao menos um serviço';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const dataAgendamento = `${form.data}T${form.hora}`;
    // const total = selecionados.reduce((acc, sel) => {
    //   const s = servicos.find((s) => s.id === sel.servicoId);
    //   return acc + (s ? valorServico(s) : 0);
    // }, 0);

    setSubmitting(true);
    setApiError('');

    try {
      const atendimento = await api.criarAtendimento({
        cliente: form.cliente,
        telefone: form.telefone.replace(/\D/g, ""),
        empresaId,
        status: 'AGENDADO',
        data_agendamento: dataAgendamento,
        valor_total: 0,
      });

      // await Promise.all(
      //   selecionados.map((sel) => {
      //     const servico = servicos.find((s) => s.id === sel.servicoId)!;
      //     const usuario = usuarios.find((u) => u.id === sel.usuarioId);
      //     return api.associarServico({
      //       atendimentoId: atendimento.id,
      //       servicoId: servico.id,
      //       servicoDescricao: servico.descricao,
      //       valorTotal: valorServico(servico),
      //       empresaId,
      //       usuarioId: usuario?.id ?? null,
      //       usuarioNome: usuario?.nome ?? '',
      //     });
      //   })
      // );

      void atendimento;
      onSuccess();
    } catch {
      setApiError('Não foi possível concluir o agendamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleDataChange(data: string) {
    setForm((prev) => ({
      ...prev,
      data,
      hora: primeiroHorarioLivre(data) ?? '',
    }));
    setErrors((prev) => ({ ...prev, data: undefined, hora: undefined }));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p>Carregando...</p>
      </div>
    );
  }

  // const totalResumo = selecionados.reduce((acc, sel) => {
  //   const s = servicos.find((s) => s.id === sel.servicoId);
  //   return acc + (s ? valorServico(s) : 0);
  // }, 0);

  const hoje = hojeStr();
  const maxData = maxDataStr();

  // Suprimir warnings de variáveis não usadas enquanto comentadas
  void servicos;
  void usuarios;
  void valorServico;
  void formatCurrency;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Field label="Seu nome" error={errors.cliente}>
        <input
          className={styles.input}
          name="cliente"
          value={form.cliente}
          onChange={handleChange}
          placeholder="Ex: Maria Silva"
        />
      </Field>

      <Field label="Seu telefone" error={errors.telefone}>
        <input
          className={styles.input}
          name="telefone"
          type="tel"
          value={formatPhone(form.telefone)}
          onChange={handleChange}
          placeholder="Ex: (98) 99999-9999"
        />
      </Field>

      <Field label="Datas disponíveis" error={errors.data}>
        <CalendarioSelector
          value={form.data}
          onChange={handleDataChange}
          minData={hoje}
          maxData={maxData}
        />
      </Field>

      {form.data && (
        <Field label="Horários disponíveis" error={errors.hora}>
          <div className={styles.horariosGrid}>
            {HORARIOS_DISPONIVEIS.map((h) => {
              const ocupado = horariosOcupadosNoDia(form.data).includes(h) || isHorarioPassado(form.data, h);
              const selecionado = form.hora === h;
              return (
                <button
                  key={h}
                  type="button"
                  disabled={ocupado}
                  className={`${styles.horarioBtn} ${selecionado ? styles.horarioBtnAtivo : ''} ${ocupado ? styles.horarioBtnOcupado : ''}`}
                  onClick={() => {
                    setForm((prev) => ({ ...prev, hora: h }));
                    setErrors((prev) => ({ ...prev, hora: undefined }));
                  }}
                >
                  {h}
                </button>
              );
            })}
          </div>
        </Field>
      )}

      {/* ── Seleção de serviços ──
      <div>
        <p className={styles.sectionLabel}>O que você vai fazer?</p>
        {errors.servicos && <span className={styles.errorMsg}>{errors.servicos}</span>}
        <div className={styles.lista}>
          {servicos.map((s) => {
            const sel = selecionados.find((x) => x.servicoId === s.id);
            const ativo = !!sel;
            const valor = valorServico(s);
            return (
              <div
                key={s.id}
                className={`${styles.card} ${ativo ? styles.cardAtivo : ''}`}
                onClick={() => toggleServico(s.id!)}
              >
                <div className={styles.cardTop}>
                  <span className={styles.cardNome}>{s.descricao}</span>
                  <div className={styles.cardValores}>
                    {s.promocao_ativo && (
                      <span className={styles.cardValorOriginal}>{formatCurrency(s.valor)}</span>
                    )}
                    <span className={styles.cardValor}>{formatCurrency(valor)}</span>
                  </div>
                </div>

                {ativo && (
                  <div className={styles.profissionalWrap} onClick={(e) => e.stopPropagation()}>
                    <p className={styles.profissionalLabel}>Profissional</p>
                    <div className={styles.profissionaisList}>
                      {usuarios.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          className={`${styles.profBtn} ${sel.usuarioId === u.id ? styles.profBtnAtivo : ''}`}
                          onClick={() => setUsuarioDoServico(s.id!, u.id)}
                        >
                          {u.nome}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selecionados.length > 0 && (
        <div className={styles.resumo}>
          <span>{selecionados.length} serviço{selecionados.length > 1 ? 's' : ''}</span>
          <strong>{formatCurrency(totalResumo)}</strong>
        </div>
      )}
      ── Fim seleção de serviços ── */}

      <div className={styles.footer}>
        {apiError && <p className={styles.apiError}>{apiError}</p>}
        <button className={styles.btn} type="submit" disabled={submitting}>
          {submitting ? 'Confirmando seu agendamento...' : 'Confirmar meu agendamento'}
        </button>
      </div>
    </form>
  );
}
