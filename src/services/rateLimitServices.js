import { supabase } from './supabase';

export const rateLimitService = {
  async checkRateLimit(userId, action) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check votes per day
      if (action === 'vote') {
        const { count } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('voted_at', today + 'T00:00:00')
          .lte('voted_at', today + 'T23:59:59');
        
        return { allowed: (count || 0) < 50, remaining: 50 - (count || 0) };
      }
      
      // Check entries per day
      if (action === 'entry') {
        const { count } = await supabase
          .from('entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', today + 'T00:00:00')
          .lte('created_at', today + 'T23:59:59');
        
        return { allowed: (count || 0) < 3, remaining: 3 - (count || 0) };
      }
      
      return { allowed: true, remaining: 0 };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: false, remaining: 0 };
    }
  },

  async logUserActivity(userId, action, metadata = {}) {
    try {
      // Create an audit log for security monitoring
      const { error } = await supabase
        .from('activity_logs') // You'll need to create this table
        .insert({
          user_id: userId,
          action,
          metadata,
          ip_address: metadata.ip,
          user_agent: metadata.userAgent,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  },

  async checkForAbuse(userId) {
    try {
      // Check for suspicious patterns
      const lastHour = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { count: recentVotes } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('voted_at', lastHour);
      
      const { count: recentEntries } = await supabase
        .from('entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', lastHour);
      
      // Flag if user has voted more than 20 times in last hour
      const isVotingAbuse = (recentVotes || 0) > 20;
      
      // Flag if user has created more than 5 entries in last hour
      const isEntryAbuse = (recentEntries || 0) > 5;
      
      return {
        flagged: isVotingAbuse || isEntryAbuse,
        reasons: [
          isVotingAbuse && 'Excessive voting',
          isEntryAbuse && 'Excessive entry creation'
        ].filter(Boolean)
      };
    } catch (error) {
      console.error('Abuse check error:', error);
      return { flagged: false, reasons: [] };
    }
  }
};