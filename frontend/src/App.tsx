import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMe } from './api';
import { User } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExtensionAuth from './pages/ExtensionAuth';

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    // Handle OAuth callback token in URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, '', window.location.pathname);
    }

    const stored = localStorage.getItem('token');
    if (!stored) { setUser(null); return; }

    getMe()
      .then(setUser)
      .catch(() => { localStorage.removeItem('token'); setUser(null); });
  }, []);

  if (user === undefined) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  return (
    <Routes>
      <Route path="/extension-auth" element={<ExtensionAuth />} />
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/auth/callback" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={() => { localStorage.removeItem('token'); setUser(null); }} /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
