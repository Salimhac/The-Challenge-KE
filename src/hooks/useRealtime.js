import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '../services/supabase';

/**
 * Custom hook for real-time subscriptions with automatic cleanup
 * @param {Object} config - Configuration for the subscription
 * @param {string} config.table - Table name to subscribe to
 * @param {string} config.event - Event type ('*', 'INSERT', 'UPDATE', 'DELETE')
 * @param {string} config.filter - Filter for specific rows (e.g., 'entry_id=eq.123')
 * @param {Function} config.onEvent - Callback function when event occurs
 * @param {boolean} config.enabled - Whether subscription is enabled
 * @param {Array} config.dependencies - Dependencies for the subscription
 */
export const useRealtime = ({
  table,
  event = '*',
  filter,
  onEvent,
  enabled = true,
  dependencies = []
}) => {
  const subscriptionRef = useRef(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const setupSubscription = useCallback(() => {
    if (!enabled || !table || !onEvent) {
      setIsSubscribed(false);
      return null;
    }

    // Clean up existing subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
      setIsSubscribed(false);
    }

    const channelName = `realtime-${table}-${Date.now()}`;
    
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter
        },
        (payload) => {
          try {
            onEvent(payload);
          } catch (error) {
            console.error('Error in real-time callback:', error);
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error(`Realtime subscription error for ${table}:`, err);
          setIsSubscribed(false);
        }
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to ${table} changes`);
          setIsSubscribed(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsSubscribed(false);
        }
      });

    subscriptionRef.current = subscription;
    return subscription;
  }, [table, event, filter, onEvent, enabled]);

  useEffect(() => {
    const subscription = setupSubscription();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
        subscriptionRef.current = null;
        setIsSubscribed(false);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupSubscription, ...dependencies]);

  const unsubscribe = useCallback(() => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
      setIsSubscribed(false);
    }
  }, []);

  const resubscribe = useCallback(() => {
    unsubscribe();
    setupSubscription();
  }, [unsubscribe, setupSubscription]);

  return {
    unsubscribe,
    resubscribe,
    isSubscribed
  };
};

/**
 * Hook for subscribing to entry votes in real-time
 */
export const useEntryVotesSubscription = (entryId, onVoteChange) => {
  const onEvent = useCallback((payload) => {
    onVoteChange(payload);
  }, [onVoteChange]);

  return useRealtime({
    table: 'votes',
    event: '*',
    filter: entryId ? `entry_id=eq.${entryId}` : undefined,
    onEvent,
    enabled: !!entryId,
    dependencies: [entryId]
  });
};

/**
 * Hook for subscribing to entry comments in real-time
 */
export const useEntryCommentsSubscription = (entryId, onCommentChange) => {
  const onEvent = useCallback((payload) => {
    onCommentChange(payload);
  }, [onCommentChange]);

  return useRealtime({
    table: 'comments',
    event: '*',
    filter: entryId ? `entry_id=eq.${entryId}` : undefined,
    onEvent,
    enabled: !!entryId,
    dependencies: [entryId]
  });
};

/**
 * Hook for subscribing to challenge entries in real-time
 */
export const useChallengeEntriesSubscription = (challengeId, onEntryChange) => {
  const onEvent = useCallback((payload) => {
    onEntryChange(payload);
  }, [onEntryChange]);

  return useRealtime({
    table: 'entries',
    event: '*',
    filter: challengeId ? `challenge_id=eq.${challengeId}` : undefined,
    onEvent,
    enabled: !!challengeId,
    dependencies: [challengeId]
  });
};

/**
 * Hook for leaderboard real-time updates
 */
export const useLeaderboardSubscription = (challengeId, onLeaderboardChange) => {
  const onEvent = useCallback((payload) => {
    // When a vote changes, trigger leaderboard update
    onLeaderboardChange(payload);
  }, [onLeaderboardChange]);

  return useRealtime({
    table: 'votes',
    event: '*',
    filter: challengeId ? `entries.challenge_id=eq.${challengeId}` : undefined,
    onEvent,
    enabled: !!challengeId,
    dependencies: [challengeId]
  });
};