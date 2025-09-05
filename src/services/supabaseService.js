import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseKey)

export const supabaseService = {
  // Get Supabase client instance
  getClient() {
    return supabase
  },

  // User Management
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            subscriptionTier: 'free',
            ...userData
          }
        }
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  },

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  // Workout Management
  async saveWorkout(workout) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .insert([{
          user_id: workout.userId,
          exercise_type: workout.exerciseType,
          start_time: workout.startTime,
          end_time: workout.endTime,
          duration: workout.duration,
          metrics: workout.metrics,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      
      // Transform back to frontend format
      return {
        workoutId: data.id,
        userId: data.user_id,
        exerciseType: data.exercise_type,
        startTime: data.start_time,
        endTime: data.end_time,
        duration: data.duration,
        metrics: data.metrics
      }
    } catch (error) {
      console.error('Error saving workout:', error)
      // Fallback to local storage in demo mode
      return this.saveWorkoutLocal(workout)
    }
  },

  async getWorkouts(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(limit)

      if (error) throw error

      // Transform to frontend format
      return data.map(workout => ({
        workoutId: workout.id,
        userId: workout.user_id,
        exerciseType: workout.exercise_type,
        startTime: workout.start_time,
        endTime: workout.end_time,
        duration: workout.duration,
        metrics: workout.metrics
      }))
    } catch (error) {
      console.error('Error getting workouts:', error)
      // Fallback to local storage in demo mode
      return this.getWorkoutsLocal(userId)
    }
  },

  async deleteWorkout(workoutId) {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting workout:', error)
      throw error
    }
  },

  // User Profile Management
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  },

  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  },

  // Exercise Library
  async getExercises() {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting exercises:', error)
      return this.getDefaultExercises()
    }
  },

  // Local Storage Fallbacks (for demo mode)
  saveWorkoutLocal(workout) {
    const workouts = JSON.parse(localStorage.getItem('fitflow_workouts') || '[]')
    const newWorkout = { ...workout, workoutId: Date.now().toString() }
    workouts.unshift(newWorkout)
    localStorage.setItem('fitflow_workouts', JSON.stringify(workouts))
    return newWorkout
  },

  getWorkoutsLocal(userId) {
    const workouts = JSON.parse(localStorage.getItem('fitflow_workouts') || '[]')
    return workouts.filter(w => w.userId === userId)
  },

  getDefaultExercises() {
    return [
      {
        id: 1,
        name: 'Push-ups',
        description: 'Classic bodyweight chest exercise',
        muscle_groups: ['chest', 'shoulders', 'triceps']
      },
      {
        id: 2,
        name: 'Squats',
        description: 'Fundamental lower body exercise',
        muscle_groups: ['quadriceps', 'glutes', 'hamstrings']
      },
      {
        id: 3,
        name: 'Pull-ups',
        description: 'Upper body pulling exercise',
        muscle_groups: ['back', 'biceps']
      },
      {
        id: 4,
        name: 'Bench Press',
        description: 'Compound chest exercise with barbell',
        muscle_groups: ['chest', 'shoulders', 'triceps']
      },
      {
        id: 5,
        name: 'Deadlift',
        description: 'Full body compound movement',
        muscle_groups: ['back', 'glutes', 'hamstrings', 'traps']
      },
      {
        id: 6,
        name: 'Running',
        description: 'Cardiovascular endurance exercise',
        muscle_groups: ['legs', 'cardiovascular']
      }
    ]
  },

  // Real-time subscriptions
  subscribeToWorkouts(userId, callback) {
    return supabase
      .channel('workouts')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'workouts',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe()
  },

  // Database setup (for development)
  async setupDatabase() {
    // This would typically be done via Supabase migrations
    // Included here for reference
    const tables = {
      users: `
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID REFERENCES auth.users ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users ON DELETE CASCADE,
          subscription_tier TEXT DEFAULT 'free',
          stripe_customer_id TEXT,
          preferences JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (id)
        );
      `,
      workouts: `
        CREATE TABLE IF NOT EXISTS workouts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users ON DELETE CASCADE,
          exercise_type TEXT NOT NULL,
          start_time TIMESTAMP WITH TIME ZONE NOT NULL,
          end_time TIMESTAMP WITH TIME ZONE,
          duration INTEGER, -- in minutes
          metrics JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      exercises: `
        CREATE TABLE IF NOT EXISTS exercises (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          muscle_groups TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }
    
    console.log('Database schema reference:', tables)
  }
}
