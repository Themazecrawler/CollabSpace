import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProjectProvider, useProjects } from './contexts/ProjectContext';
import { SocketProvider } from './contexts/SocketContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';
import Whiteboard from './pages/Whiteboard';
import Analytics from './pages/Analytics';
import TeamManagement from './pages/TeamManagement';
import Settings from './pages/Settings';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';

function AppRoutes() {
  const { user, isLoading } = useAuth();
  const { setUser } = useProjects();

  // Update project context when user changes
  React.useEffect(() => {
    if (user) {
      setUser(user.id);
    } else {
      setUser(null);
    }
  }, [user, setUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/project/:id" element={<ProjectBoard />} />
        <Route path="/whiteboard/:id" element={<Whiteboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/team" element={<TeamManagement />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <SocketProvider>
          <Router>
            <AppRoutes />
          </Router>
        </SocketProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;