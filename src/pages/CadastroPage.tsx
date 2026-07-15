import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '../api';
import { useNotif } from '../context/NotifContext';
import { GradientButton } from '../components/GradientButton';

type Step = 1 | 2 | 3;

export function CadastroPage() {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dadosEncontrados, setDadosEncontrados] = useState<{ nome?: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { notify } = useNotif();
  const navigate = useNavigate();

  async function handleVerificar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const dados = await api.verificarEmail(email);
      setDadosEncontrados(dados);
      setShowModal(true);
    } catch {
      notify('E-mail não encontrado ou já cadastrado', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleEnviarCodigo() {
    setShowModal(false);
    setLoading(true);
    try {
      await api.enviarCodigo(email);
      notify('Código enviado para seu e-mail', 'success');
      setStep(2);
    } catch {
      notify('Erro ao enviar código', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleValidar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.validarCodigo(email, codigo);
      setStep(3);
    } catch {
      notify('Código inválido ou expirado', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 6) { notify('Senha deve ter ao menos 6 caracteres', 'warning'); return; }
    if (senha !== confirmSenha) { notify('As senhas não coincidem', 'warning'); return; }
    setLoading(true);
    try {
      await api.salvarSenha(email, senha);
      notify('Cadastro realizado com sucesso!', 'success');
      navigate('/login');
    } catch {
      notify('Erro ao salvar senha', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #3D3535, #4A4035, #6B5B4E)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p style={{ color: '#D4A5A5', fontSize: 30, fontWeight: 800 }}>Lumien</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Etapa {step} de 3</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 18, padding: 28 }}>
          {step === 1 && (
            <form onSubmit={handleVerificar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark1)' }}>Verificar e-mail</h2>
              <div>
                <label style={labelStyle}>E-mail</label>
                <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
              </div>
              <GradientButton type="submit" loading={loading} style={{ width: '100%' }}>Verificar</GradientButton>
              <Link to="/login" style={{ textAlign: 'center', color: 'var(--grad-end)', fontSize: 13, textDecoration: 'none' }}>Já tenho conta</Link>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleValidar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark1)' }}>Validar código</h2>
              <p style={{ fontSize: 13, color: 'var(--dark2)' }}>Insira o código enviado para <strong>{email}</strong></p>
              <div>
                <label style={labelStyle}>Código</label>
                <input style={inputStyle} value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="000000" />
              </div>
              <GradientButton type="submit" loading={loading} style={{ width: '100%' }}>Validar</GradientButton>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark1)' }}>Criar senha</h2>
              <div>
                <label style={labelStyle}>Nova senha</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...inputStyle, paddingRight: 44 }} type={showSenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
                  <button type="button" onClick={() => setShowSenha(!showSenha)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dark2)' }}>
                    {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirmar senha</label>
                <input style={inputStyle} type="password" value={confirmSenha} onChange={(e) => setConfirmSenha(e.target.value)} placeholder="Repita a senha" />
              </div>
              <GradientButton type="submit" loading={loading} style={{ width: '100%' }}>Salvar</GradientButton>
            </form>
          )}
        </div>
      </div>

      {showModal && dadosEncontrados && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 340, width: '100%' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Dados encontrados</h3>
            {dadosEncontrados.nome && <p style={{ marginBottom: 16, color: 'var(--dark2)' }}>Olá, <strong>{dadosEncontrados.nome}</strong>! Vamos enviar um código para seu e-mail.</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <GradientButton variant="ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancelar</GradientButton>
              <GradientButton onClick={handleEnviarCodigo} loading={loading} style={{ flex: 1 }}>Enviar código</GradientButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--dark1)', display: 'block', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #ddd', fontSize: 15, outline: 'none', boxSizing: 'border-box' };
