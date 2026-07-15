import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, BarChart2, Scissors, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function BottomNav() {
  const { user } = useAuth();
  const isAdmin = user?.perfil === 'ADMIN';

  const links = [
    ...(isAdmin ? [{ to: '/dashboard', icon: <LayoutDashboard size={22} />, label: 'Dashboard' }] : []),
    { to: '/atendimentos', icon: <CalendarCheck size={22} />, label: 'Atendimentos' },
    ...(isAdmin ? [{ to: '/relatorios', icon: <BarChart2 size={22} />, label: 'Relatórios' }] : []),
    ...(isAdmin ? [{ to: '/servicos', icon: <Scissors size={22} />, label: 'Serviços' }] : []),
    { to: '/menu', icon: <Menu size={22} />, label: 'Menu' },
  ];

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff', borderTop: '1px solid #eee',
      display: 'flex', justifyContent: 'space-around',
      padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
      zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
    }}>
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: isActive ? 'var(--grad-end)' : 'var(--dark2)',
            textDecoration: 'none', fontSize: 10, fontWeight: 600,
            transition: 'color .2s',
          })}
        >
          {l.icon}
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}
