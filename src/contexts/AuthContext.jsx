import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

// Remove the useAuth export from here
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // FIXED: Added createProfileIfMissing function
  const createProfileIfMissing = async (userId, email, nickname, campusId) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!existingProfile) {
        // Create profile with default values
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            nickname: nickname || `User_${userId.substring(0, 8)}`,
            campus_id: campusId || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Manual profile creation failed:', error);
          // If nickname is the issue, try without it
          if (error.message.includes('nickname')) {
            await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: email,
                nickname: `User_${userId.substring(0, 8)}`,
                campus_id: campusId || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
          }
        } else {
          console.log('Profile created manually');
          // Refresh profile
          await fetchProfile(userId);
        }
      }
    } catch (error) {
      console.error('Profile check/create error:', error);
    }
  };

  // UPDATED: Fixed signIn function
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      // Fetch profile after sign in
      if (data.user) {
        await fetchProfile(data.user.id);
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Fixed signUp function - This is the main fix!
  const signUp = async (email, password, nickname, campusId) => {
    setLoading(true);
    try {
      console.log('Starting signup for:', email);
      
      // Ensure nickname is not empty
      const userNickname = nickname || `User_${Math.random().toString(36).substr(2, 8)}`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname: userNickname,
            campus_id: campusId || null
          }
        }
      });

      if (error) {
        console.error('Signup auth error:', error);
        throw error;
      }

      console.log('Auth signup successful, user ID:', data.user?.id);
      
      // IMPORTANT: Create profile if database trigger fails
      if (data.user) {
        // Wait a bit for the trigger
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check and create profile if missing
        await createProfileIfMissing(data.user.id, email, userNickname, campusId);
        
        // Auto sign in after successful signup
        const signInResult = await signIn(email, password);
        if (!signInResult.success) {
          console.warn('Auto sign-in failed:', signInResult.error);
        }
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, ...updates }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the context for the hook to use
export { AuthContext };