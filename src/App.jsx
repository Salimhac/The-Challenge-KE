import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { useAuth } from './hooks/useAuth';
import Home from './components/screens/Home/Home';
import Upload from './components/screens/Upload/Upload';
import EntriesFeed from './components/screens/EntriesFeed/EntriesFeed';
import Leaderboard from './components/screens/Leaderboard/Leaderboard';
import AdminPanel from './components/admin/AdminPanel';
import AuthModal from './components/auth/AuthModal';
import Header from './components/layout/Header/Header';
import Auth from "./components/screens/auth/Auth.jsx";
import './styles/global.css';
import Footer from './components/layout/Footer/Footer';
import LegalPages from './pages/LegalPages';
import ProfilePage from './components/ProfilePage.jsx';
import EntriesPage from './components/EntriesPage';



// Protected route component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading} = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  if (requireAdmin && user.email !== 'admin@example.com') {
    return <Navigate to="/" />;
  }
  
  return children;
};

const AppContent = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <>
      <Header 
  user={user} 
  onLogin={() => setShowAuthModal(true)} 
  onLogout={signOut}
/>
     
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/my-profile" element={<ProfilePage />} />
        <Route path="/upload" element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        } />
        <Route path="/entries" element={<EntriesFeed />} />
          <Route path="/legal/:page" element={<LegalPages />} />
  <Route path="/terms" element={<LegalPages />} /> {/* Shortcut */}
  <Route path="/privacy" element={<LegalPages />} /> {/* Shortcut */}
          <Route path="/auth" element={<Auth />} />
                  <Route path="/my-entries" element={<EntriesPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminPanel />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
            <Footer />

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;