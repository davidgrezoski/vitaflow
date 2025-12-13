import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/Store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Hydration from './pages/Hydration';
import Workout from './pages/Workout';
import Chat from './pages/Chat';
import Specialist from './pages/Specialist'; // Importado
import Auth from './pages/Auth';
import Paywall from './components/Paywall';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, user, trialStatus } = useApp();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <Loader2 className="animate-spin text-emerald-600 w-8 h-8" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (!user && window.location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  if (trialStatus.isExpired) {
    return <Paywall />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/profile" element={<Calculator />} />
                  <Route path="/hydration" element={<Hydration />} />
                  <Route path="/workout" element={<Workout />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/specialist" element={<Specialist />} /> {/* Nova Rota */}
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
