import { useState, useCallback } from 'react';
import { voteService } from '../services/voteService';
import { useAuth } from './useAuth';

export const useVoting = () => {
  const { user } = useAuth();
  const [votingStates, setVotingStates] = useState({});
  const [userVotesToday, setUserVotesToday] = useState([]);

  const vote = useCallback(async (entryId) => {
    if (!user) {
      throw new Error('Please sign in to vote');
    }

    setVotingStates(prev => ({ ...prev, [entryId]: 'voting' }));

    try {
      const result = await voteService.voteForEntry(entryId, user.id);
      
      if (result.success) {
        setUserVotesToday(prev => [...prev, entryId]);
        setVotingStates(prev => ({ ...prev, [entryId]: 'voted' }));
        return { success: true };
      } else {
        setVotingStates(prev => ({ ...prev, [entryId]: 'idle' }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      setVotingStates(prev => ({ ...prev, [entryId]: 'idle' }));
      return { success: false, error: error.message };
    }
  }, [user]);

  const unvote = useCallback(async (entryId) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    setVotingStates(prev => ({ ...prev, [entryId]: 'unvoting' }));

    try {
      const result = await voteService.unvoteEntry(entryId, user.id);
      
      if (result.success) {
        setUserVotesToday(prev => prev.filter(id => id !== entryId));
        setVotingStates(prev => ({ ...prev, [entryId]: 'idle' }));
        return { success: true };
      } else {
        setVotingStates(prev => ({ ...prev, [entryId]: 'idle' }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      setVotingStates(prev => ({ ...prev, [entryId]: 'idle' }));
      return { success: false, error: error.message };
    }
  }, [user]);

  const checkIfUserVoted = useCallback(async (entryId) => {
    if (!user) return false;
    
    if (userVotesToday.includes(entryId)) return true;
    
    const hasVoted = await voteService.hasUserVotedToday(entryId, user.id);
    if (hasVoted) {
      setUserVotesToday(prev => [...prev, entryId]);
    }
    return hasVoted;
  }, [user, userVotesToday]);

  const loadUserVotes = useCallback(async () => {
    if (!user) return;
    
    const votes = await voteService.getUserVotesToday(user.id);
    setUserVotesToday(votes);
  }, [user]);

  return {
    vote,
    unvote,
    checkIfUserVoted,
    loadUserVotes,
    votingStates,
    userVotesToday
  };
};