import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type NotifType = 'success' | 'error' | 'info' | 'warning';

interface Notif {
  id: number;
  type: NotifType;
  message: string;
}

interface NotifContextType {
  notify: (message: string, type?: NotifType) => void;
}

const NotifContext = createContext<NotifContextType>(null!);

let counter = 0;

export function NotifProvider({ children }: { children: ReactNode }) {
  const [notifs, setNotifs] = useState<Notif[]>([]);

  const notify = useCallback((message: string, type: NotifType = 'info') => {
    const id = ++counter;
    setNotifs((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setNotifs((prev) => prev.filter((n) => n.id !== id)), 3500);
  }, []);

  const colors: Record<NotifType, string> = {
    success: '#7A9E87',
    error: '#C0392B',
    info: '#4A4035',
    warning: '#C9A84C',
  };

  return (
    <NotifContext.Provider value={{ notify }}>
      {children}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notifs.map((n) => (
          <div key={n.id} style={{
            background: colors[n.type], color: '#fff', padding: '12px 20px',
            borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            fontSize: 14, fontWeight: 500, maxWidth: 320,
            animation: 'fadeIn .2s ease',
          }}>
            {n.message}
          </div>
        ))}
      </div>
    </NotifContext.Provider>
  );
}

export function useNotif() { return useContext(NotifContext); }
