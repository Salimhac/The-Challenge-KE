import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminPanel.module.css';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('challenges');
  
  const [challenges, setChallenges] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    theme: '',
    start_date: '',
    end_date: ''
  });

  const checkAdminStatus = useCallback(async () => {
      console.log('User object:', user);
  console.log('User email:', user?.email);

  if (!user) {
        console.log('No user, redirecting to home');
    navigate('/');
    return;
  }

  // Simple email check
const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [];
  
  if (!adminEmails.includes(user.email)) {
    alert('Access denied. Admins only.');
    navigate('/');
    return;
  }

  setIsAdmin(true);
  setLoading(false);
}, [user, navigate]);

  const loadData = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      if (activeTab === 'challenges') {
        const { data, error } = await supabase
          .from('challenges')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setChallenges(data || []);
      } else if (activeTab === 'reports') {
        const { data, error } = await supabase
          .from('reports')
          .select(`
            *,
            entries!inner (title, video_url, profiles!inner (nickname))
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setReports(data || []);
      } else if (activeTab === 'stats') {
        const today = new Date().toISOString().split('T')[0];
        
        const [
          { count: totalUsers },
          { count: totalEntries },
          { count: todayVotes },
          { data: campusStats }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('entries').select('*', { count: 'exact', head: true }),
          supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .gte('voted_at', today + 'T00:00:00'),
          supabase
            .from('entries')
            .select(`
              profiles!inner (
                campus_id,
                campuses (name)
              )
            `)
            .eq('is_approved', true)
        ]);

        setStats({
          totalUsers,
          totalEntries,
          todayVotes,
          campusStats: campusStats || []
        });
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  }, [isAdmin, activeTab]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, activeTab, loadData]);

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('challenges')
        .insert([{
          ...newChallenge,
          is_active: true
        }]);

      if (error) throw error;

      alert('Challenge created successfully!');
      setNewChallenge({
        title: '',
        description: '',
        theme: '',
        start_date: '',
        end_date: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Error creating challenge: ' + error.message);
    }
  };

  const handleToggleChallenge = async (challengeId, isActive) => {
    try {
      const { error } = await supabase
        .from('challenges')
        .update({ is_active: !isActive })
        .eq('id', challengeId);

      if (error) throw error;
      
      loadData();
      alert('Challenge status updated!');
    } catch (error) {
      console.error('Error toggling challenge:', error);
      alert('Error updating challenge: ' + error.message);
    }
  };

  const handleReportAction = async (reportId, action, entryId = null) => {
    try {
      if (action === 'remove' && entryId) {
        // Remove entry and mark report as reviewed
        await Promise.all([
          supabase.from('entries').update({ is_approved: false }).eq('id', entryId),
          supabase.from('reports').update({ status: 'reviewed' }).eq('id', reportId)
        ]);
      } else if (action === 'dismiss') {
        await supabase
          .from('reports')
          .update({ status: 'dismissed' })
          .eq('id', reportId);
      }

      loadData();
      alert('Action completed!');
    } catch (error) {
      console.error('Error handling report:', error);
      alert('Error: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        Loading admin panel...
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          ← Back to Site
        </button>
        <h1 className={styles.title}>Admin Panel</h1>
        <div className={styles.adminInfo}>
          <span className={styles.adminBadge}>Admin</span>
          <span className={styles.adminEmail}>{user?.email}</span>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <button
            className={`${styles.sidebarButton} ${activeTab === 'challenges' ? styles.active : ''}`}
            onClick={() => setActiveTab('challenges')}
          >
            🏆 Challenges
          </button>
          <button
            className={`${styles.sidebarButton} ${activeTab === 'reports' ? styles.active : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            ⚠️ Reports
          </button>
          <button
            className={`${styles.sidebarButton} ${activeTab === 'stats' ? styles.active : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Statistics
          </button>
          <button
            className={`${styles.sidebarButton} ${activeTab === 'new' ? styles.active : ''}`}
            onClick={() => setActiveTab('new')}
          >
            ➕ New Challenge
          </button>
        </div>

        <div className={styles.mainContent}>
          {activeTab === 'challenges' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Manage Challenges</h2>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Theme</th>
                      <th>Dates</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challenges.map((challenge) => (
                      <tr key={challenge.id}>
                        <td>
                          <strong>{challenge.title}</strong>
                          <p className={styles.description}>{challenge.description}</p>
                        </td>
                        <td>{challenge.theme || '—'}</td>
                        <td>
                          {format(new Date(challenge.start_date), 'MMM d')} -<br />
                          {format(new Date(challenge.end_date), 'MMM d, yyyy')}
                        </td>
                        <td>
                          <span className={`${styles.status} ${challenge.is_active ? styles.active : styles.inactive}`}>
                            {challenge.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button
                              onClick={() => handleToggleChallenge(challenge.id, challenge.is_active)}
                              className={styles.actionButton}
                            >
                              {challenge.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => {
                                navigate(`/entries?challenge=${challenge.id}`);
                              }}
                              className={styles.actionButton}
                            >
                              View Entries
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Content Reports</h2>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Entry</th>
                      <th>Reason</th>
                      <th>Reporter</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td>
                          <a
                            href={report.entries?.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.entryLink}
                          >
                            {report.entries?.title || 'Unknown Entry'}
                          </a>
                          <p className={styles.userInfo}>
                            By: {report.entries?.profiles?.nickname || 'Unknown'}
                          </p>
                        </td>
                        <td>{report.reason}</td>
                        <td>User ID: {report.user_id.substring(0, 8)}...</td>
                        <td>
                          {format(new Date(report.created_at), 'MMM d, HH:mm')}
                        </td>
                        <td>
                          <span className={`${styles.status} ${styles[report.status]}`}>
                            {report.status}
                          </span>
                        </td>
                        <td>
                          {report.status === 'pending' && (
                            <div className={styles.actions}>
                              <button
                                onClick={() => handleReportAction(report.id, 'remove', report.entry_id)}
                                className={`${styles.actionButton} ${styles.remove}`}
                              >
                                Remove Entry
                              </button>
                              <button
                                onClick={() => handleReportAction(report.id, 'dismiss')}
                                className={`${styles.actionButton} ${styles.dismiss}`}
                              >
                                Dismiss
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reports.length === 0 && (
                  <p className={styles.emptyMessage}>No pending reports.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && stats && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Platform Statistics</h2>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <h3 className={styles.statTitle}>Total Users</h3>
                  <p className={styles.statValue}>{stats.totalUsers || 0}</p>
                </div>
                <div className={styles.statCard}>
                  <h3 className={styles.statTitle}>Total Entries</h3>
                  <p className={styles.statValue}>{stats.totalEntries || 0}</p>
                </div>
                <div className={styles.statCard}>
                  <h3 className={styles.statTitle}>Today's Votes</h3>
                  <p className={styles.statValue}>{stats.todayVotes || 0}</p>
                </div>
                <div className={styles.statCard}>
                  <h3 className={styles.statTitle}>Active Challenge</h3>
                  <p className={styles.statValue}>
                    {challenges.find(c => c.is_active)?.title || 'None'}
                  </p>
                </div>
              </div>

              <h3 className={styles.subTitle}>Campus Participation</h3>
              <div className={styles.campusStats}>
                {Object.entries(
                  stats.campusStats.reduce((acc, entry) => {
                    const campusName = entry.profiles?.campuses?.name || 'Unknown';
                    acc[campusName] = (acc[campusName] || 0) + 1;
                    return acc;
                  }, {})
                )
                  .sort(([,a], [,b]) => b - a)
                  .map(([campus, count]) => (
                    <div key={campus} className={styles.campusStat}>
                      <span className={styles.campusName}>{campus}</span>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill}
                          style={{ 
                            width: `${(count / stats.totalEntries) * 100}%` 
                          }}
                        />
                      </div>
                      <span className={styles.campusCount}>{count} entries</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'new' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Create New Challenge</h2>
              <form onSubmit={handleCreateChallenge} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Challenge Title *</label>
                  <input
                    type="text"
                    value={newChallenge.title}
                    onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                    className={styles.input}
                    placeholder="e.g., Best Campus Dance Challenge"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Description *</label>
                  <textarea
                    value={newChallenge.description}
                    onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                    className={styles.textarea}
                    placeholder="Describe the challenge rules and requirements..."
                    rows={4}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Theme/Tags (Optional)</label>
                  <input
                    type="text"
                    value={newChallenge.theme}
                    onChange={(e) => setNewChallenge({...newChallenge, theme: e.target.value})}
                    className={styles.input}
                    placeholder="e.g., Dance, Comedy, Talent"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Start Date *</label>
                    <input
                      type="date"
                      value={newChallenge.start_date}
                      onChange={(e) => setNewChallenge({...newChallenge, start_date: e.target.value})}
                      className={styles.input}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>End Date *</label>
                    <input
                      type="date"
                      value={newChallenge.end_date}
                      onChange={(e) => setNewChallenge({...newChallenge, end_date: e.target.value})}
                      className={styles.input}
                      required
                      min={newChallenge.start_date || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <button type="submit" className={styles.submitButton}>
                  Create Challenge
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;