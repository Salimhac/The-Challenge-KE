import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './CommentModal.module.css';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../hooks/useAuth';
import { format } from 'date-fns';

const CommentModal = ({ entry, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const subscriptionRef = useRef(null);

  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!inner (
            nickname,
            avatar_url
          )
        `)
        .eq('entry_id', entry.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [entry.id]);

  const handleNewComment = useCallback((payload) => {
    if (payload.eventType === 'INSERT') {
      // Fetch profile for new comment
      supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('id', payload.new.user_id)
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            setComments(prev => [{
              ...payload.new,
              profiles: profile
            }, ...prev]);
          }
        });
    } else if (payload.eventType === 'DELETE') {
      setComments(prev => prev.filter(comment => comment.id !== payload.old.id));
    }
  }, []);

  useEffect(() => {
    // Fetch comments
    fetchComments();
    
    // Subscribe to real-time comments
    const subscription = supabase
      .channel(`entry-${entry.id}-comments-list`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `entry_id=eq.${entry.id}`
        },
        handleNewComment
      )
      .subscribe();

    subscriptionRef.current = subscription;

    // Cleanup subscription
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [entry.id, fetchComments, handleNewComment]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          entry_id: entry.id,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;
      
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Error posting comment: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error deleting comment: ' + error.message);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMinutes = Math.floor((now - commentDate) / (1000 * 60));
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return format(commentDate, 'MMM d, yyyy');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            Comments ({comments.length})
            {entry.title && (
              <span className={styles.entryTitle}> on "{entry.title}"</span>
            )}
          </h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.commentsList}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className={styles.empty}>
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                      {comment.profiles?.nickname?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className={styles.userDetails}>
                      <span className={styles.username}>
                        {comment.profiles?.nickname || 'Anonymous'}
                      </span>
                      <span className={styles.time}>
                        {formatTime(comment.created_at)}
                      </span>
                    </div>
                  </div>
                  {user?.id === comment.user_id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className={styles.deleteButton}
                      title="Delete comment"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <p className={styles.commentContent}>{comment.content}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmitComment} className={styles.commentForm}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className={styles.input}
              placeholder={user ? "Add a comment..." : "Sign in to comment"}
              disabled={!user || submitting}
              maxLength={500}
            />
            <div className={styles.inputActions}>
              <span className={styles.charCount}>
                {newComment.length}/500
              </span>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={!newComment.trim() || !user || submitting}
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentModal;