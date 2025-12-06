import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

/**
 * Custom hook for Supabase operations with loading and error states
 */
export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Execute a Supabase query with loading and error handling
   */
  const executeQuery = useCallback(async (queryFn, options = {}) => {
    const { showLoading = true, resetError = true } = options;
    
    if (resetError) setError(null);
    if (showLoading) setLoading(true);

    try {
      const result = await queryFn();
      return { data: result.data, error: result.error, success: !result.error };
    } catch (err) {
      console.error('Supabase query error:', err);
      setError(err.message || 'An error occurred');
      return { data: null, error: err.message, success: false };
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  /**
   * Fetch entries for a challenge
   */
  const fetchEntries = useCallback(async (challengeId, options = {}) => {
    return executeQuery(async () => {
      const { page = 1, limit = 10, sortBy = 'created_at', order = 'desc' } = options;
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      return await supabase
        .from('entries')
        .select(`
          *,
          profiles!inner (
            nickname,
            campus_id,
            campuses (name, type)
          ),
          challenges!inner (title, description),
          comments (count)
        `)
        .eq('challenge_id', challengeId)
        .eq('is_approved', true)
        .order(sortBy, { ascending: order === 'asc' })
        .range(from, to);
    });
  }, [executeQuery]);

  /**
   * Fetch current active challenge
   */
  const fetchCurrentChallenge = useCallback(async () => {
    return executeQuery(async () => {
      const today = new Date().toISOString().split('T')[0];
      
      return await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', today)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();
    });
  }, [executeQuery]);

  /**
   * Fetch leaderboard data
   */
  const fetchLeaderboard = useCallback(async (challengeId, campusId = 'all', limit = 100) => {
    return executeQuery(async () => {
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
        .eq('challenge_id', challengeId)
        .eq('is_approved', true);

      if (campusId !== 'all') {
        query = query.eq('profiles.campus_id', campusId);
      }

      return await query
        .order('vote_count', { ascending: false })
        .limit(limit);
    });
  }, [executeQuery]);

  /**
   * Fetch user's profile
   */
  const fetchUserProfile = useCallback(async (userId) => {
    return executeQuery(async () => {
      return await supabase
        .from('profiles')
        .select('*, campuses (name, type)')
        .eq('id', userId)
        .maybeSingle();
    });
  }, [executeQuery]);

  /**
   * Create a new entry
   */
  const createEntry = useCallback(async (entryData) => {
    return executeQuery(async () => {
      return await supabase
        .from('entries')
        .insert([entryData])
        .select()
        .maybeSingle();
    });
  }, [executeQuery]);

  /**
   * Add a comment to an entry
   */
  const addComment = useCallback(async (commentData) => {
    return executeQuery(async () => {
      return await supabase
        .from('comments')
        .insert([commentData])
        .select()
        .maybeSingle();
    });
  }, [executeQuery]);

  /**
   * Fetch comments for an entry
   */
  const fetchComments = useCallback(async (entryId, limit = 50) => {
    return executeQuery(async () => {
      return await supabase
        .from('comments')
        .select(`
          *,
          profiles!inner (
            nickname,
            avatar_url
          )
        `)
        .eq('entry_id', entryId)
        .order('created_at', { ascending: false })
        .limit(limit);
    });
  }, [executeQuery]);

  /**
   * Fetch all campuses
   */
  const fetchCampuses = useCallback(async () => {
    return executeQuery(async () => {
      return await supabase
        .from('campuses')
        .select('*')
        .order('name');
    }, { showLoading: false });
  }, [executeQuery]);

  /**
   * Check if user has voted for an entry today
   */
  const checkUserVoteToday = useCallback(async (entryId, userId) => {
    return executeQuery(async () => {
      const today = new Date().toISOString().split('T')[0];
      
      return await supabase
        .from('votes')
        .select('id')
        .eq('entry_id', entryId)
        .eq('user_id', userId)
        .gte('voted_at', today + 'T00:00:00')
        .maybeSingle();
    }, { showLoading: false });
  }, [executeQuery]);

  /**
   * Get user's votes for today
   */
  const getUserTodayVotes = useCallback(async (userId) => {
    return executeQuery(async () => {
      const today = new Date().toISOString().split('T')[0];
      
      return await supabase
        .from('votes')
        .select('entry_id')
        .eq('user_id', userId)
        .gte('voted_at', today + 'T00:00:00');
    }, { showLoading: false });
  }, [executeQuery]);

  /**
   * Report inappropriate content
   */
  const reportContent = useCallback(async (reportData) => {
    return executeQuery(async () => {
      return await supabase
        .from('reports')
        .insert([reportData]);
    });
  }, [executeQuery]);

  /**
   * Get platform statistics
   */
  const getPlatformStats = useCallback(async () => {
    return executeQuery(async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const [
        { count: totalUsers },
        { count: totalEntries },
        { count: activeChallenges },
        { count: todayVotes }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('entries').select('*', { count: 'exact', head: true }),
        supabase.from('challenges').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('votes').select('*', { count: 'exact', head: true }).gte('voted_at', today + 'T00:00:00')
      ]);

      return {
        data: {
          totalUsers: totalUsers || 0,
          totalEntries: totalEntries || 0,
          activeChallenges: activeChallenges || 0,
          todayVotes: todayVotes || 0
        },
        error: null
      };
    });
  }, [executeQuery]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Upload user avatar
   */
  const uploadAvatar = useCallback(async (userId, file) => {
    return executeQuery(async () => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      return await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
        .select()
        .maybeSingle();
    });
  }, [executeQuery]);

  return {
    supabase,
    loading,
    error,
    clearError,
    executeQuery,
    fetchEntries,
    fetchCurrentChallenge,
    fetchLeaderboard,
    fetchUserProfile,
    createEntry,
    addComment,
    fetchComments,
    fetchCampuses,
    checkUserVoteToday,
    getUserTodayVotes,
    reportContent,
    getPlatformStats,
    uploadAvatar
  };
};