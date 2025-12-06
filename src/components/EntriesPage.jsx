// pages/EntriesPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import './EntriesPage.css';

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }, []);

  const fetchUserEntries = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
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

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  }, [user]); // Add user as dependency

  useEffect(() => {
    checkUser();
  }, [checkUser]); // Add checkUser to dependencies

  useEffect(() => {
    if (user) {
      fetchUserEntries();
    }
  }, [user, fetchUserEntries]); // Add fetchUserEntries to dependencies

  // Remove the unused handleDeleteEntry if not using it
  const handleDeleteEntry = useCallback(async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', entryId);
      
      if (error) {
        alert('Error deleting entry: ' + error.message);
      } else {
        alert('Entry deleted successfully!');
        window.location.reload();
      }
    }
  }, []);

  if (!user) {
    return (
      <div className="entries-container">
        <div className="login-prompt">
          <h2>Please log in to view your entries</h2>
          <button onClick={() => window.location.href = '/login'}>
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
        <button 
          className="new-entry-btn"
          onClick={() => window.location.href = '/upload'}
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
          <button onClick={() => window.location.href = '/upload'}>
            Create Your First Entry
          </button>
        </div>
      ) : (
        <div className="entries-grid">
          {entries.map((entry) => (
            <EntryCard 
              key={entry.id} 
              entry={entry} 
              onDelete={handleDeleteEntry} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Separate component for entry card to clean up the main component
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
          onClick={() => window.location.href = `/edit-entry/${entry.id}`}
        >
          Edit
        </button>
        <button 
          className="action-btn delete"
          onClick={() => onDelete(entry.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}