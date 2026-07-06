import type { IAtendimento, IServicoItem, IServico, IUsuario } from './types';

const BASE = import.meta.env.VITE_API_BASE_URL as string;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text as unknown as T;
  }
}

export const api = {
  getServicos: (empresaId: number) =>
    request<IServico[]>(`${BASE}/servico/buscar?empresaId=${empresaId}`),

  getUsuarios: (empresaId: number) =>
    request<IUsuario[]>(`${BASE}/usuario/buscar-todos?empresaId=${empresaId}`),

  criarAtendimento: (body: Omit<IAtendimento, 'servicos'>) =>
    request<{ id: number }>(`${BASE}/atendimento/cadastrar`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  associarServico: (body: IServicoItem) =>
    request(`${BASE}/atendimento-servico/cadastrar`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
