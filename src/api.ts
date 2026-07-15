import axios from 'axios';
import type { IAtendimento, IServico, IServicoItem, IUsuario, IDisponibilidade, IEmpresa } from './types';
import type { TotalizadoresInterface } from './pages/DashboardPage';

const BASE = 'https://meu-salao-digital-api.onrender.com/api/v1';

export const http = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('lumien_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {
  // Auth
  login: (email: string, senha: string) =>
    http.post('/usuario/login', { email, senha }).then((r) => r.data),

  verificarEmail: (email: string) =>
    http.post('/usuario/verificar-email', { email }).then((r) => r.data),

  enviarCodigo: (email: string) =>
    http.post('/usuario/enviar-codigo', { email }).then((r) => r.data),

  validarCodigo: (email: string, codigo: string) =>
    http.post('/usuario/validar-codigo', { email, codigo }).then((r) => r.data),

  salvarSenha: (email: string, senha: string) =>
    http.post('/usuario/salvar-senha', { email, senha }).then((r) => r.data),

  // Empresa
  getDadosEmpresa: (empresaId: number) =>
    http.get<IEmpresa[]>(`/empresa/buscar?empresaId=${empresaId}`).then((r) => r.data),

  // Disponibilidade
  getDisponibilidade: (empresaId: number) =>
    http.get<IDisponibilidade[]>(`/atendimento/disponibilidade?empresaId=${empresaId}`).then((r) => r.data),

  // Serviços
  getServicos: (empresaId: number) =>
    http.get<IServico[]>(`/servico/buscar?empresaId=${empresaId}`).then((r) => r.data),

  criarServico: (body: Omit<IServico, 'id'>) =>
    http.post('/servico/cadastrar', body).then((r) => r.data),

  editarServico: (id: number, body: Partial<IServico>) =>
    http.put(`/servico/editar/${id}`, body).then((r) => r.data),

  excluirServico: (id: number) =>
    http.delete(`/servico/excluir/${id}`).then((r) => r.data),

  // Usuários / Profissionais
  getUsuarios: (empresaId: number) =>
    http.get<IUsuario[]>(`/usuario/buscar-todos?empresaId=${empresaId}`).then((r) => r.data),

  // Atendimentos
  getAtendimentos: (empresaId: number, status?: string) => {
    const params = new URLSearchParams({ empresaId: String(empresaId) });
    if (status && status !== 'TODOS') params.append('status', status);
    return http.get<IAtendimento[]>(`/atendimento/buscar?${params}`).then((r) => r.data);
  },

  getAtendimentosPorPeriodo: (empresaId: number, de: string, ate: string, status?: string) => {
    const params = new URLSearchParams({ empresaId: String(empresaId), de, ate });
    if (status && status !== 'TODOS') params.append('status', status);
    return http.get<IAtendimento[]>(`/atendimento/buscar?${params}`).then((r) => r.data);
  },

  getTotalizadores: (empresaId: number, tipoTempo?: string) => {
    const params = new URLSearchParams({ empresaId: String(empresaId), tipoTempo: String(tipoTempo) });
    return http.get<TotalizadoresInterface>(`/atendimento/buscar-totalizador?${params}`).then((r) => r.data);
  },

  criarAtendimento: (body: Omit<IAtendimento, 'servicos' | 'id'>) =>
    http.post<{ id: number }>('/atendimento/cadastrar', body).then((r) => r.data),

  atualizarStatus: (id: number, status: string) =>
    http.put(`/atendimento/atualizar-status/${id}`, { status }).then((r) => r.data),

  associarServico: (body: IServicoItem) =>
    http.post('/atendimento-servico/cadastrar', body).then((r) => r.data),
};
