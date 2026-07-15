export type AtendimentoStatus = 'EM_ANDAMENTO' | 'AGENDADO' | 'FINALIZADO' | 'CANCELADO';
export type UserRole = 'ADMIN' | 'PROFISSIONAL';

export interface IUsuario {
  id: number;
  nome: string;
  email: string;
  empresaId: number;
  perfil: UserRole;
}

export interface IEmpresa {
  id: number;
  description: string;
}

export interface IServico {
  id: number;
  descricao: string;
  valor: number;
  valor_promocao: number;
  ativo: boolean;
  empresaId: number;
  promocao_ativo: boolean;
}

export interface IServicoItem {
  id?: number;
  atendimentoId?: number;
  empresaId?: number;
  servicoId?: number;
  usuarioId: number | null;
  servicoDescricao: string;
  usuarioNome: string;
  valorTotal: number;
}

export interface IAtendimento {
  id?: number;
  cliente: string;
  telefone: string;
  servicos: IServicoItem[];
  dataCriacao?: string;
  data_agendamento: string;
  valor_total: number;
  status: AtendimentoStatus;
  empresaId: number;
}

export interface IDisponibilidade {
  data: string;
  horariosDisponiveis: string[];
}

export interface IAuthUser {
  id: number;
  nome: string;
  email: string;
  empresaId: number;
  perfil: UserRole;
  token: string;
}

export interface IDashboardKPIs {
  totalAtendimentos: number;
  emAndamento: number;
  finalizados: number;
  faturamento: number;
}
