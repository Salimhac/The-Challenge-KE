// pages/EntriesPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../../hooks/useAuth'; // Add this import
import './EntriesPage.css';

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Use your existing auth hook instead of managing user state here
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserEntries();
    } else if (!authLoading) {
      // If auth is done loading and no user, stay on page but show login prompt
      // The login prompt UI will handle this
    }
  }, [user, authLoading]);

  const fetchUserEntries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Fetching entries for user:', user.id);
      
      const { data, error } = await supabase
        .from('entries')
        .select(`
          *,
          challenges!inner(title, description),
          profiles!inner(nickname, avatar_url),
          votes(count),
          comments(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
        throw error;
      }
      
      console.log('Entries fetched:', data?.length || 0);
      setEntries(data || []);
    } catch (error) {
      console.error('Error in fetchUserEntries:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const { error } = await supabase
          .from('entries')
          .delete()
          .eq('id', entryId);
        
        if (error) throw error;
        
        alert('Entry deleted successfully!');
        // Refresh entries after deletion
        fetchUserEntries();
      } catch (error) {
        alert('Error deleting entry: ' + error.message);
      }
    }
  };
console.log('Current user:', user?.id);
console.log('Auth loading:', authLoading);
console.log('Entries count:', entries.length);
  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="entries-container">
        <div className="loading">Checking authentication...</div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="entries-container">
        <div className="login-prompt">
          <h2>Please log in to view your entries</h2>
          <button onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="entries-container">
      <div className="entries-header">
        <h1>My Entries</h1>
        <div className="user-info">
          <span>Logged in as: {user.email}</span>
          <button 
            onClick={() => {
              supabase.auth.signOut();
              navigate('/');
            }}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
        <button 
          className="new-entry-btn"
          onClick={() => navigate('/upload')}
        >
          + New Entry
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading your entries...</div>
      ) : entries.length === 0 ? (
        <div className="no-entries">
          <h3>No entries yet</h3>
          <p>Submit your first entry to get started!</p>
          <button onClick={() => navigate('/upload')}>
            Create Your First Entry
          </button>
        </div>
      ) : (
        <>
          <div className="entries-summary">
            <p>Showing <strong>{entries.length}</strong> entries</p>
            <button 
              onClick={fetchUserEntries}
              className="refresh-btn"
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>
          <div className="entries-grid">
            {entries.map((entry) => (
              <EntryCard 
                key={entry.id} 
                entry={entry} 
                onDelete={handleDeleteEntry} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EntryCard({ entry, onDelete }) {
  return (
    <div className="entry-card">
      <div className="entry-header">
        <h3>{entry.title || 'Untitled Entry'}</h3>
        <span className={`status ${entry.is_approved ? 'approved' : 'pending'}`}>
          {entry.is_approved ? '✓ Approved' : '⏳ Pending'}
        </span>
      </div>
      
      <div className="entry-challenge">
        <strong>Challenge:</strong> {entry.challenges.title}
      </div>
      
      {entry.description && (
        <p className="entry-description">{entry.description}</p>
      )}
      
      {entry.video_url && (
        <div className="entry-video">
          <a 
            href={entry.video_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="video-link"
          >
            🎬 Watch Video
          </a>
          {entry.platform && (
            <span className="platform-badge">{entry.platform}</span>
          )}
        </div>
      )}
      
      <div className="entry-stats">
        <div className="stat">
          <span className="stat-icon">👍</span>
          <span>{entry.votes?.[0]?.count || 0} votes</span>
        </div>
        <div className="stat">
          <span className="stat-icon">💬</span>
          <span>{entry.comments?.[0]?.count || 0} comments</span>
        </div>
        <div className="stat">
          <span className="stat-icon">📅</span>
          <span>{new Date(entry.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="entry-actions">
        <button 
          className="action-btn edit"
          onClick={() => window.open(`/edit-entry/${entry.id}`, '_self')}
        >
          Edit
        </button>
        <button 
          className="action-btn delete"
          onClick={() => onDelete(entry.id)}
        >
          Delete
        </button>
        <button 
          className="action-btn share"
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/entry/${entry.id}`);
            alert('Link copied to clipboard!');
          }}
        >
          Share
        </button>
      </div>
    </div>
  );
}