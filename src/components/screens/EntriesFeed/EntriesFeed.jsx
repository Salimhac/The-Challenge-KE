import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EntriesFeed.module.css';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../hooks/useAuth';
import { useVoting } from '../../../hooks/useVoting';
import EntryCard from '../../common/EntryCard/EntryCard';
import CommentModal from '../../common/CommentModal/CommentModal';

const EntriesFeed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vote, unvote, checkIfUserVoted, loadUserVotes, userVotesToday } = useVoting();
  
  const [entries, setEntries] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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

  const fetchEntries = useCallback(async () => {
    if (!currentChallenge) return;
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('entries')
        .select(`
          *,
          profiles!inner (nickname, campus_id, campuses (name, type)),
          challenges!inner (title),
          comments (count)
        `)
        .eq('challenge_id', currentChallenge.id)
        .eq('is_approved', true);

      if (sortBy === 'popular') {
        query = query.order('vote_count', { ascending: false });
      } else if (sortBy === 'trending') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const from = (page - 1) * 10;
      const to = from + 9;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      if (page === 1) {
        setEntries(data || []);
      } else {
        setEntries(prev => [...prev, ...(data || [])]);
      }

      setHasMore((data?.length || 0) === 10);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  }, [currentChallenge, sortBy, page]);

  const updateEntryVoteCount = useCallback((entryId, change) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          vote_count: Math.max(0, (entry.vote_count || 0) + change)
        };
      }
      return entry;
    }));
  }, []);

  useEffect(() => {
    fetchCurrentChallenge();
    loadUserVotes();
  }, [fetchCurrentChallenge, loadUserVotes]);

  useEffect(() => {
    if (currentChallenge) {
      fetchEntries();
    }
  }, [currentChallenge, sortBy, page, fetchEntries]);

  const handleVote = useCallback(async (entryId) => {
    if (!user) {
      alert('Please sign in to vote');
      return;
    }

    const hasVoted = userVotesToday.includes(entryId) || await checkIfUserVoted(entryId);
    
    if (hasVoted) {
      const confirmUnvote = window.confirm('You have already voted for this today. Remove your vote?');
      if (confirmUnvote) {
        await unvote(entryId);
        updateEntryVoteCount(entryId, -1);
      }
    } else {
      const result = await vote(entryId);
      if (result.success) {
        updateEntryVoteCount(entryId, 1);
      } else {
        alert(result.error);
      }
    }
  }, [user, userVotesToday, checkIfUserVoted, unvote, updateEntryVoteCount, vote]);

  const handleShare = useCallback(async (entry) => {
    const shareUrl = `${window.location.origin}/entry/${entry.id}`;
    const shareText = `Check out "${entry.title}" on Kenya Campus Challenge!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: entry.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const getTimeAgo = useCallback((date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  }, []);

  const handleCommentClick = useCallback((entry) => {
    setSelectedEntry(entry);
    setShowComments(true);
  }, []);

  const handleCloseComments = useCallback(() => {
    setShowComments(false);
    setSelectedEntry(null);
  }, []);

  if (!currentChallenge) {
    return (
      <div className={styles.noChallenge}>
        <h2>No Active Challenge</h2>
        <p>There are no entries to display right now.</p>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          Go to Home
        </button>
      </div>
    );
  }

  const totalVotes = entries.reduce((sum, entry) => sum + (entry.vote_count || 0), 0);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          ← Back
        </button>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>All Entries</h1>
          <p className={styles.subtitle}>{currentChallenge.title}</p>
        </div>
        <button onClick={() => navigate('/upload')} className={styles.uploadButton}>
          + Upload Video
        </button>
      </header>

      <div className={styles.content}>
        <div className={styles.filters}>
          <div className={styles.sortButtons}>
            <button
              className={`${styles.sortButton} ${sortBy === 'latest' ? styles.active : ''}`}
              onClick={() => {
                setSortBy('latest');
                setPage(1);
              }}
            >
              Latest
            </button>
            <button
              className={`${styles.sortButton} ${sortBy === 'popular' ? styles.active : ''}`}
              onClick={() => {
                setSortBy('popular');
                setPage(1);
              }}
            >
              Most Popular
            </button>
            <button
              className={`${styles.sortButton} ${sortBy === 'trending' ? styles.active : ''}`}
              onClick={() => {
                setSortBy('trending');
                setPage(1);
              }}
            >
              Trending
            </button>
          </div>
          <div className={styles.stats}>
            <span className={styles.stat}>
              {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
            </span>
            <span className={styles.stat}>
              Total Votes: {totalVotes}
            </span>
          </div>
        </div>

        <div className={styles.entriesGrid}>
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onVote={() => handleVote(entry.id)}
              onShare={() => handleShare(entry)}
              onComment={() => handleCommentClick(entry)}
              hasVoted={userVotesToday.includes(entry.id)}
              timeAgo={getTimeAgo(entry.created_at)}
              user={user}
            />
          ))}
        </div>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            Loading entries...
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📹</div>
            <h3>No entries yet</h3>
            <p>Be the first to submit a video for this challenge!</p>
            <button onClick={() => navigate('/upload')} className={styles.uploadCta}>
              Upload Your Video
            </button>
          </div>
        )}

        {!loading && hasMore && entries.length > 0 && (
          <div className={styles.loadMoreContainer}>
            <button onClick={handleLoadMore} className={styles.loadMoreButton}>
              Load More
            </button>
          </div>
        )}
      </div>

      {showComments && selectedEntry && (
        <CommentModal
          entry={selectedEntry}
          onClose={handleCloseComments}
        />
      )}
    </div>
  );
};

export default EntriesFeed;