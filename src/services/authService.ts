import { supabase } from "@/integrations/supabase/client";
import { Session, User, AuthError } from "@supabase/supabase-js";

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * Service for managing authentication operations.
 * Centralizes all Supabase Auth interactions including sign in, sign up, and sign out.
 * 
 * @example
 * ```typescript
 * // Sign in
 * const result = await authService.signIn('user@example.com', 'password');
 * if (result.user) {
 *   console.log('Signed in:', result.user.email);
 * }
 * 
 * // Sign up
 * const newUser = await authService.signUp('new@example.com', 'password123');
 * 
 * // Sign out
 * await authService.signOut();
 * ```
 */
export class AuthService {
  /**
   * Signs in a user with email and password
   * 
   * @param email - User email address
   * @param password - User password
   * @returns Promise resolving to AuthResult containing user, session, and any errors
   * 
   * @example
   * ```typescript
   * const result = await authService.signIn('user@example.com', 'mypassword');
   * if (result.error) {
   *   console.error('Login failed:', result.error.message);
   * } else {
   *   console.log('Welcome:', result.user?.email);
   * }
   * ```
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return {
        user: data.user,
        session: data.session,
        error,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Signs up a new user with email and password
   * 
   * @param email - New user email address
   * @param password - New user password
   * @returns Promise resolving to AuthResult with user data
   * 
   * @example
   * ```typescript
   * const result = await authService.signUp('newuser@example.com', 'securepassword');
   * if (result.user) {
   *   console.log('Account created! Check email for verification.');
   * }
   * ```
   */
  async signUp(email: string, password: string): Promise<AuthResult> {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      return {
        user: data.user,
        session: data.session,
        error,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Signs out the current user
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error as AuthError };
    }
  }

  /**
   * Gets the current user session
   */
  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      return {
        session: data.session,
        error,
      };
    } catch (error) {
      console.error('Get session error:', error);
      return {
        session: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Gets the current user
   */
  async getUser(): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();
      return {
        user: data.user,
        error,
      };
    } catch (error) {
      console.error('Get user error:', error);
      return {
        user: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Sets up a listener for auth state changes
   * @param callback - Function to call when auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(event, session);
      }
    );

    return () => subscription.unsubscribe();
  }
}

// Export singleton instance
export const authService = new AuthService();
