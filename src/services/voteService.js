import { supabase } from './supabase';
import { VOTING_COOLDOWN_MS } from '../utils/constants';

export const voteService = {
  async voteForEntry(entryId, userId) {
    try {
      // Check if user has already voted today
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('entry_id', entryId)
        .eq('user_id', userId)
        .gte('voted_at', new Date(Date.now() - VOTING_COOLDOWN_MS).toISOString())
        .maybeSingle();

      if (existingVote) {
        return { success: false, error: 'You have already voted for this entry today' };
      }

      // Check daily vote limit
      const today = new Date().toISOString().split('T')[0];
      const { count: dailyVotes } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('voted_at', today + 'T00:00:00')
        .lte('voted_at', today + 'T23:59:59');

      if (dailyVotes >= 50) {
        return { success: false, error: 'Daily vote limit reached (50 votes)' };
      }

      // Create vote
      const { error } = await supabase
        .from('votes')
        .insert({
          entry_id: entryId,
          user_id: userId
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error voting:', error);
      return { success: false, error: error.message };
    }
  },

  async unvoteEntry(entryId, userId) {
    try {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('entry_id', entryId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error unvoting:', error);
      return { success: false, error: error.message };
    }
  },

  async hasUserVotedToday(entryId, userId) {
    try {
      const { data } = await supabase
        .from('votes')
        .select('id')
        .eq('entry_id', entryId)
        .eq('user_id', userId)
        .gte('voted_at', new Date(Date.now() - VOTING_COOLDOWN_MS).toISOString())
        .maybeSingle();

      return !!data;
    } catch  {
      return false;
    }
  },

  async getUserVotesToday(userId) {
    try {
      const { data } = await supabase
        .from('votes')
        .select('entry_id')
        .eq('user_id', userId)
        .gte('voted_at', new Date().toISOString().split('T')[0] + 'T00:00:00');

      return data?.map(vote => vote.entry_id) || [];
    } catch  {
      return [];
    }
  },

  subscribeToVotes(entryId, callback) {
    const subscription = supabase
      .channel(`entry-votes-${entryId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `entry_id=eq.${entryId}`
        },
        callback
      )
      .subscribe((_status, err) => { // Use underscore prefix for unused status
        if (err) {
          console.error('Subscription error:', err);
        }
      });

    return subscription;
  }
};