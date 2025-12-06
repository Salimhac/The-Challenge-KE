// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();

  // List of admin emails - update with your actual admin emails
  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [];
  // Check if current user is admin
  const isAdmin = user && adminEmails.includes(user.email);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Option 1: Redirect to home
    return <Navigate to="/" replace />;
    
    // Option 2: Show access denied message (uncomment if you want this)
    /*
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h2>Access Denied</h2>
        <p>Admin privileges required.</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
    */
  }

  return children;
}