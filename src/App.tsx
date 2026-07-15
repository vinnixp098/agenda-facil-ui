import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotifProvider } from './context/NotifContext';
import { LoginPage } from './pages/LoginPage';
import { CadastroPage } from './pages/CadastroPage';
import { AlterarSenhaPage } from './pages/AlterarSenhaPage';
import { DashboardPage } from './pages/DashboardPage';
import { AtendimentosPage } from './pages/AtendimentosPage';
import { RelatoriosPage } from './pages/RelatoriosPage';
import { ServicosPage } from './pages/ServicosPage';
import { MenuPage } from './pages/MenuPage';
import type { ReactNode } from 'react';

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.perfil !== 'ADMIN') return <Navigate to="/atendimentos" replace />;
  return <>{children}</>;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.perfil === 'ADMIN' ? '/dashboard' : '/atendimentos'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroPage />} />
      <Route path="/alterar-senha" element={<AlterarSenhaPage />} />
      <Route path="/dashboard" element={<RequireAdmin><DashboardPage /></RequireAdmin>} />
      <Route path="/atendimentos" element={<RequireAuth><AtendimentosPage /></RequireAuth>} />
      <Route path="/relatorios" element={<RequireAdmin><RelatoriosPage /></RequireAdmin>} />
      <Route path="/servicos" element={<RequireAdmin><ServicosPage /></RequireAdmin>} />
      <Route path="/menu" element={<RequireAuth><MenuPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotifProvider>
          <AppRoutes />
        </NotifProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
