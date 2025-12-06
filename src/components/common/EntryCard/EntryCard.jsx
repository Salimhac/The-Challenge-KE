import React, { useState, useEffect } from 'react';
import styles from './EntryCard.module.css';
import { getEmbedUrl } from '../../../utils/videoUtils';
import { supabase } from '../../../services/supabase';

const EntryCard = ({ 
  entry, 
  onVote, 
  onShare, 
  onComment, 
  hasVoted, 
  timeAgo,
  user 
}) => {
  const [voteCount, setVoteCount] = useState(entry.vote_count || 0);
  const [isVoting, setIsVoting] = useState(false);
  const [commentCount, setCommentCount] = useState(entry.comments?.[0]?.count || 0);

  useEffect(() => {
    setVoteCount(entry.vote_count || 0);
  }, [entry.vote_count]);

  useEffect(() => {
    // Subscribe to real-time vote updates
    const subscription = supabase
      .channel(`entry-${entry.id}-votes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `entry_id=eq.${entry.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setVoteCount(prev => prev + 1);
          } else if (payload.eventType === 'DELETE') {
            setVoteCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    // Subscribe to comment count updates
    const commentSubscription = supabase
      .channel(`entry-${entry.id}-comments`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `entry_id=eq.${entry.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCommentCount(prev => prev + 1);
          } else if (payload.eventType === 'DELETE') {
            setCommentCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      commentSubscription.unsubscribe();
    };
  }, [entry.id]);

  const handleVoteClick = async () => {
    if (isVoting) return;
    
    setIsVoting(true);
    try {
      await onVote();
    } finally {
      setIsVoting(false);
    }
  };

  const embedUrl = getEmbedUrl(entry.platform, entry.video_id);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {entry.profiles?.nickname?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className={styles.userDetails}>
            <h3 className={styles.username}>{entry.profiles?.nickname || 'Anonymous'}</h3>
            <div className={styles.meta}>
              <span className={styles.time}>{timeAgo}</span>
              {entry.profiles?.campuses?.name && (
                <>
                  <span className={styles.separator}>•</span>
                  <span className={styles.campus}>{entry.profiles.campuses.name}</span>
                </>
              )}
            </div>
          </div>
        </div>
        {user?.id === entry.user_id && (
          <span className={styles.badge}>Your Entry</span>
        )}
      </div>

      <div className={styles.videoContainer}>
        <iframe
          src={embedUrl}
          title={entry.title}
          className={styles.video}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>

      <div className={styles.content}>
        <h4 className={styles.title}>{entry.title}</h4>
        {entry.description && (
          <p className={styles.description}>{entry.description}</p>
        )}
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <button
            className={`${styles.voteButton} ${hasVoted ? styles.voted : ''}`}
            onClick={handleVoteClick}
            disabled={isVoting}
            title={hasVoted ? 'Remove vote' : 'Vote for this entry'}
          >
            <span className={styles.voteIcon}>{hasVoted ? '❤️' : '🤍'}</span>
            <span className={styles.voteCount}>{voteCount}</span>
          </button>
        </div>

        <div className={styles.statItem}>
          <button
            className={styles.actionButton}
            onClick={onComment}
            title="View comments"
          >
            <span className={styles.actionIcon}>💬</span>
            <span className={styles.actionCount}>{commentCount}</span>
          </button>
        </div>

        <div className={styles.statItem}>
          <button
            className={styles.actionButton}
            onClick={onShare}
            title="Share this entry"
          >
            <span className={styles.actionIcon}>↗️</span>
            <span className={styles.actionLabel}>Share</span>
          </button>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.challengeTag}>
          #{entry.challenges?.title?.replace(/\s+/g, '')}
        </span>
        <div className={styles.platform}>
          <span className={styles.platformIcon}>
            {entry.platform === 'tiktok' ? '🎵' : '📷'}
          </span>
          <span className={styles.platformText}>
            {entry.platform === 'tiktok' ? 'TikTok' : 'Instagram'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EntryCard;