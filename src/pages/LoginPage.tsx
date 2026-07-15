import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';
import { GradientButton } from '../components/GradientButton';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { notify } = useNotif();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !senha) { notify('Preencha todos os campos', 'warning'); return; }
    setLoading(true);
    try {
      const user = await api.login(email, senha);
      login(user);
      navigate(user.perfil === 'ADMIN' ? '/dashboard' : '/atendimentos');
    } catch {
      notify('E-mail ou senha inválidos', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #3D3535, #4A4035, #6B5B4E)',
      padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="../public/image-logo.png" alt="" style={{width: '80px', borderRadius: "50%"}}/>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 }}>Gestão profissional do seu salão</p>
        </div>
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 18, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>E-mail</label>
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>
          <div>
            <label style={labelStyle}>Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...inputStyle, paddingRight: 44 }}
                type={showSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••"
              />
              <button type="button" onClick={() => setShowSenha(!showSenha)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dark2)' }}>
                {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <GradientButton type="submit" loading={loading} style={{ width: '100%', marginTop: 4 }}>
            Entrar
          </GradientButton>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <Link to="/alterar-senha" style={linkStyle}>Esqueceu a senha?</Link>
            <Link to="/cadastro" style={linkStyle}>Cadastre-se</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--dark1)', display: 'block', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #ddd', fontSize: 15, outline: 'none', boxSizing: 'border-box' };
const linkStyle: React.CSSProperties = { color: 'var(--grad-end)', textDecoration: 'none', fontWeight: 500 };
