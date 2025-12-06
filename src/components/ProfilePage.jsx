// src/pages/ProfilePage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase'; 
import './ProfilePage.css';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalVotes: 0,
    totalComments: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchProfile(user.id);
      fetchUserStats(user.id);
    }
  }, []);

  const fetchProfile = useCallback(async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*, campuses(name, type, location)')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserStats = useCallback(async (userId) => {
    try {
      // Get total entries
      const { count: entriesCount } = await supabase
        .from('entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get total votes received (sum of vote_count from entries)
      const { data: entries } = await supabase
        .from('entries')
        .select('vote_count')
        .eq('user_id', userId);

      const totalVotes = entries?.reduce((sum, entry) => sum + (entry.vote_count || 0), 0) || 0;

      // Get total comments on user's entries
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('entry_id', userId)
        .eq('user_id', userId);

      setStats({
        totalEntries: entriesCount || 0,
        totalVotes: totalVotes,
        totalComments: commentsCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="login-prompt">
          <h2>Please log in to view your profile</h2>
          <button onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="avatar-placeholder">
            {profile?.nickname?.charAt(0) || user.email?.charAt(0) || 'U'}
          </div>
          <div className="avatar-info">
            <h1>{profile?.nickname}</h1>
            <p className="email">{user.email}</p>
            <p className="member-since">
              Member since: {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="profile-actions">
        
          <button className="btn-secondary" onClick={handleSignOut}>
            🚪 Sign Out
          </button>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.totalEntries}</div>
          <div className="stat-label">Total Entries</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👍</div>
          <div className="stat-value">{stats.totalVotes}</div>
          <div className="stat-label">Total Votes</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-value">{stats.totalComments}</div>
          <div className="stat-label">Comments</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">
            {stats.totalVotes > 1000 ? 'Pro' : stats.totalVotes > 500 ? 'Intermediate' : 'Beginner'}
          </div>
          <div className="stat-label">Level</div>
        </div>
      </div>

      <div className="profile-details">
        <div className="detail-section">
          <h3>📚 Campus Information</h3>
          {profile?.campuses ? (
            <div className="campus-info">
              <p><strong>Campus:</strong> {profile.campuses.name}</p>
              <p><strong>Type:</strong> {profile.campuses.type}</p>
              {profile.campuses.location && (
                <p><strong>Location:</strong> {profile.campuses.location}</p>
              )}
            </div>
          ) : (
            <p className="no-data">No campus information available</p>
          )}
        </div>

        <div className="detail-section">
          <h3>🎯 Recent Activity</h3>
          {stats.totalEntries > 0 ? (
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-icon">✓</span>
                <span>Submitted {stats.totalEntries} entries</span>
              </div>
              <div className="activity-item">
                <span className="activity-icon">👍</span>
                <span>Received {stats.totalVotes} total votes</span>
              </div>
              <div className="activity-item">
                <span className="activity-icon">💬</span>
                <span>Made {stats.totalComments} comments</span>
              </div>
            </div>
          ) : (
            <p className="no-data">No activity yet. Join a challenge to get started!</p>
          )}
        </div>

        <div className="detail-section">
          <h3>⚡ Quick Actions</h3>
          <div className="action-buttons">
            <button 
              className="action-btn"
              onClick={() => navigate('/entries')}
            >
              📋 View My Entries
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/upload')}
            >
              🎬 Submit New Entry
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/')}
            >
              🏆 Browse Challenges
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}