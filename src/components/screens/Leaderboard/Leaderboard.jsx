import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Leaderboard.module.css';
import { supabase } from '../../../services/supabase';
import { format, differenceInSeconds } from 'date-fns';
import { useLeaderboardSubscription } from "../../../hooks/useRealtime";



const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [timePercentage, setTimePercentage] = useState(100);
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [campuses, setCampuses] = useState([]);
  const timerRef = useRef(null);

  const fetchCurrentChallenge = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setCurrentChallenge(data);
    } catch (error) {
      console.error('Error fetching challenge:', error);
    }
  }, []);

  const fetchCampuses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('campuses')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCampuses(data || []);
    } catch (error) {
      console.error('Error fetching campuses:', error);
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    if (!currentChallenge) return;
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('entries')
        .select(`
          *,
          profiles!inner (
            nickname,
            campus_id,
            campuses (name, type)
          ),
          challenges!inner (title)
        `)
        .eq('challenge_id', currentChallenge.id)
        .eq('is_approved', true);

      if (selectedCampus !== 'all') {
        query = query.eq('profiles.campus_id', selectedCampus);
      }

      const { data, error } = await query
        .order('vote_count', { ascending: false })
        .limit(100);

      if (error) throw error;

      const rankedEntries = (data || []).map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

      setLeaderboard(rankedEntries);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [currentChallenge, selectedCampus]);

  // Refresh leaderboard when votes change using the realtime subscription
  useLeaderboardSubscription(currentChallenge?.id, async () => {
    if (currentChallenge) {
      loadLeaderboard();
    }
  });

  const startCountdown = useCallback(() => {
    if (!currentChallenge) return;

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const updateCountdown = () => {
      const endDate = new Date(currentChallenge.end_date);
      const now = new Date();
      const totalSeconds = differenceInSeconds(endDate, new Date(currentChallenge.start_date));
      const remainingSeconds = differenceInSeconds(endDate, now);

      if (remainingSeconds <= 0) {
        setTimeLeft('Challenge ended!');
        setTimePercentage(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        return;
      }

      const days = Math.floor(remainingSeconds / (24 * 3600));
      const hours = Math.floor((remainingSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }

      const percentage = Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100));
      setTimePercentage(percentage);
    };

    // Initial call
    updateCountdown();
    
    // Set up interval
    timerRef.current = setInterval(updateCountdown, 1000);

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentChallenge]);

  useEffect(() => {
    fetchCurrentChallenge();
    fetchCampuses();
  }, [fetchCurrentChallenge, fetchCampuses]);

  useEffect(() => {
    if (currentChallenge) {
      loadLeaderboard();
      const cleanup = startCountdown();
      return cleanup;
    }
  }, [currentChallenge, selectedCampus, loadLeaderboard, startCountdown]);

  const getRankIcon = useCallback((rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  }, []);

  const getRankClass = useCallback((rank) => {
    switch (rank) {
      case 1: return styles.gold;
      case 2: return styles.silver;
      case 3: return styles.bronze;
      default: return '';
    }
  }, [styles]);

  const handleCampusChange = useCallback((e) => {
    setSelectedCampus(e.target.value);
  }, []);

  const handleRowClick = useCallback((entryId) => {
    navigate(`/entry/${entryId}`);
  }, [navigate]);

  const handleUploadClick = useCallback(() => {
    navigate('/upload');
  }, [navigate]);

  const handleBackClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  if (!currentChallenge) {
    return (
      <div className={styles.noChallenge}>
        <h2>No Active Challenge</h2>
        <p>There's no leaderboard to display right now.</p>
        <button onClick={handleBackClick} className={styles.backButton}>
          Go to Home
        </button>
      </div>
    );
  }

  const totalVotes = leaderboard.reduce((sum, entry) => sum + (entry.vote_count || 0), 0);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={handleBackClick} className={styles.backButton}>
          ← Back
        </button>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Leaderboard</h1>
          <p className={styles.subtitle}>{currentChallenge.title}</p>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.challengeInfo}>
          <div className={styles.infoCard}>
            <div className={styles.infoHeader}>
              <h3 className={styles.infoTitle}>Challenge Progress</h3>
              <span className={styles.timer}>{timeLeft}</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${timePercentage}%` }}
              />
            </div>
            <div className={styles.progressDates}>
              <span>{format(new Date(currentChallenge.start_date), 'MMM d')}</span>
              <span>{format(new Date(currentChallenge.end_date), 'MMM d')}</span>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.filters}>
              <h3 className={styles.infoTitle}>Filter by Campus</h3>
              <select
                value={selectedCampus}
                onChange={handleCampusChange}
                className={styles.campusSelect}
              >
                <option value="all">All Campuses/Estates</option>
                {campuses.map(campus => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Total Entries</span>
                <span className={styles.statValue}>{leaderboard.length}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Total Votes</span>
                <span className={styles.statValue}>
                  {totalVotes}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.leaderboardContainer}>
          <div className={styles.leaderboardHeader}>
            <div className={styles.headerRow}>
              <div className={styles.rankColumn}>Rank</div>
              <div className={styles.entryColumn}>Entry</div>
              <div className={styles.campusColumn}>Campus</div>
              <div className={styles.votesColumn}>Votes</div>
            </div>
          </div>

          <div className={styles.leaderboardBody}>
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                Loading leaderboard...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className={styles.empty}>
                <p>No entries found for the selected filter.</p>
              </div>
            ) : (
              leaderboard.map((entry) => (
                <div 
                  key={entry.id} 
                  className={`${styles.leaderboardRow} ${getRankClass(entry.rank)}`}
                  onClick={() => handleRowClick(entry.id)}
                >
                  <div className={styles.rankColumn}>
                    <span className={`${styles.rank} ${getRankClass(entry.rank)}`}>
                      {getRankIcon(entry.rank)}
                    </span>
                  </div>
                  <div className={styles.entryColumn}>
                    <div className={styles.entryInfo}>
                      <div className={styles.avatar}>
                        {entry.profiles?.nickname?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className={styles.entryDetails}>
                        <h4 className={styles.entryTitle}>{entry.title}</h4>
                        <p className={styles.entryUser}>@{entry.profiles?.nickname || 'Anonymous'}</p>
                      </div>
                    </div>
                  </div>
                  <div className={styles.campusColumn}>
                    <span className={styles.campusBadge}>
                      {entry.profiles?.campuses?.name || '—'}
                    </span>
                  </div>
                  <div className={styles.votesColumn}>
                    <div className={styles.votesDisplay}>
                      <span className={styles.votesIcon}>❤️</span>
                      <span className={styles.votesCount}>{entry.vote_count || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {!loading && leaderboard.length > 0 && (
            <div className={styles.leaderboardFooter}>
              <div className={styles.topPerformers}>
                <h4 className={styles.footerTitle}>🏆 Top 3 Performers</h4>
                <div className={styles.performersList}>
                  {leaderboard.slice(0, 3).map((entry) => (
                    <div key={entry.id} className={styles.performer}>
                      <span className={styles.performerRank}>
                        {getRankIcon(entry.rank)}
                      </span>
                      <span className={styles.performerName}>
                        {entry.profiles?.nickname}
                      </span>
                      <span className={styles.performerVotes}>
                        {entry.vote_count} votes
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={handleUploadClick}
                className={styles.uploadButton}
              >
                Join the Competition
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;