import { useNavigate } from 'react-router-dom';
import { KeyRound, Scissors, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/AppLayout';

export function MenuPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.perfil === 'ADMIN';

  const items = [
    { icon: <KeyRound size={20} />, label: 'Redefinir senha', action: () => navigate('/alterar-senha') },
    ...(isAdmin ? [{ icon: <Scissors size={20} />, label: 'Gestão de Serviços', action: () => navigate('/servicos') }] : []),
  ];

  return (
    <AppLayout>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--dark1)', marginBottom: 8 }}>Menu</h1>

      <div style={{ background: '#fff', borderRadius: 14, padding: '8px 0', boxShadow: '0 2px 10px var(--shadow)', marginBottom: 16 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0f0' }}>
          <p style={{ fontWeight: 700, fontSize: 16 }}>{user?.nome}</p>
          <p style={{ color: 'var(--dark2)', fontSize: 13 }}>{user?.email}</p>
          <span style={{
            display: 'inline-block', marginTop: 6, fontSize: 11, fontWeight: 600,
            background: isAdmin ? 'linear-gradient(135deg, #D4A5A5, #C4855A)' : '#eee',
            color: isAdmin ? '#fff' : 'var(--dark2)',
            padding: '2px 10px', borderRadius: 20,
          }}>
            {isAdmin ? 'Admin' : 'Profissional'}
          </span>
        </div>

        {items.map((item, i) => (
          <button key={i} onClick={item.action} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--dark1)', fontWeight: 500, fontSize: 15 }}>
              <span style={{ color: 'var(--grad-end)' }}>{item.icon}</span>
              {item.label}
            </div>
            <ChevronRight size={18} color="var(--dark2)" />
          </button>
        ))}
      </div>

      <button onClick={logout} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
        background: '#fff', color: '#C0392B', fontWeight: 700, fontSize: 15,
        boxShadow: '0 2px 10px var(--shadow)',
      }}>
        <LogOut size={18} /> Sair da conta
      </button>
    </AppLayout>
  );
}
