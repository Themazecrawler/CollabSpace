import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
  createdAt: string;
}

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'member' // Default role
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      // Handle specific Supabase errors
      if (error.message.includes('User already registered') || error.message.includes('already been registered')) {
        throw new Error('User already exists. Please sign in instead.');
      }
      throw error;
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      throw new Error('Account created! Please check your email for confirmation link before signing in.');
    }

    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Handle specific Supabase errors
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link before signing in.');
      }
      if (error.message.includes('User not found')) {
        throw new Error('User not found. Please sign up first.');
      }
      throw error;
    }

    // Get user profile
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        // If profile doesn't exist, create it
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || 'User',
            role: data.user.user_metadata?.role || 'member',
            created_at: new Date().toISOString()
          });

        if (insertError) throw insertError;

        // Return the created profile
        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || 'User',
            role: data.user.user_metadata?.role || 'member',
            avatar: data.user.user_metadata?.avatar_url,
            createdAt: new Date().toISOString()
          },
          session: data.session
        };
      }

      return {
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          avatar: profile.avatar_url,
          createdAt: profile.created_at
        },
        session: data.session
      };
    }

    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Profile lookup error:', error);
      // If profile doesn't exist, return user data from auth
      return {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || 'User',
        role: user.user_metadata?.role || 'member',
        avatar: user.user_metadata?.avatar_url,
        createdAt: user.created_at
      };
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      avatar: profile.avatar_url,
      createdAt: profile.created_at
    };
  },

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<AuthUser>) {
    const { error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        role: updates.role,
        avatar_url: updates.avatar
      })
      .eq('id', userId);

    if (error) throw error;
  },

  // Reset password
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
  },

  // Update password
  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) throw error;
  }
};
