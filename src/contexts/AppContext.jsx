import React, { createContext, useContext, useState, useEffect } from 'react'
import { openaiService } from '../services/openaiService'
import { supabaseService } from '../services/supabaseService'
import { stripeService } from '../services/stripeService'
import toast from 'react-hot-toast'

const AppContext = createContext()

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(false)
  const [subscriptionTier, setSubscriptionTier] = useState('free')

  // Initialize demo user and data
  useEffect(() => {
    const initializeApp = () => {
      const demoUser = {
        userId: 'demo-user-1',
        email: 'demo@fitflow.ai',
        subscriptionTier: 'free',
        preferences: {}
      }
      setUser(demoUser)
      
      // Load demo workouts
      const demoWorkouts = [
        {
          workoutId: '1',
          userId: 'demo-user-1',
          exerciseType: 'Push-ups',
          startTime: new Date(Date.now() - 86400000 * 7), // 7 days ago
          endTime: new Date(Date.now() - 86400000 * 7 + 1200000), // 20 minutes later
          duration: 20,
          metrics: { sets: 3, reps: 15, weight: 0 }
        },
        {
          workoutId: '2',
          userId: 'demo-user-1',
          exerciseType: 'Squats',
          startTime: new Date(Date.now() - 86400000 * 5),
          endTime: new Date(Date.now() - 86400000 * 5 + 1800000),
          duration: 30,
          metrics: { sets: 4, reps: 20, weight: 0 }
        },
        {
          workoutId: '3',
          userId: 'demo-user-1',
          exerciseType: 'Bench Press',
          startTime: new Date(Date.now() - 86400000 * 3),
          endTime: new Date(Date.now() - 86400000 * 3 + 2400000),
          duration: 40,
          metrics: { sets: 3, reps: 8, weight: 135 }
        },
        {
          workoutId: '4',
          userId: 'demo-user-1',
          exerciseType: 'Running',
          startTime: new Date(Date.now() - 86400000 * 1),
          endTime: new Date(Date.now() - 86400000 * 1 + 1800000),
          duration: 30,
          metrics: { distance: 3.2, pace: '9:22', calories: 320 }
        }
      ]
      setWorkouts(demoWorkouts)
    }

    initializeApp()
  }, [])

  const logWorkout = async (workoutDescription) => {
    setLoading(true)
    try {
      // Use AI to parse the workout description
      const parsedWorkout = await openaiService.parseWorkout(workoutDescription)
      
      const newWorkout = {
        workoutId: Date.now().toString(),
        userId: user.userId,
        exerciseType: parsedWorkout.exerciseType,
        startTime: new Date(),
        endTime: new Date(Date.now() + parsedWorkout.estimatedDuration * 60 * 1000),
        duration: parsedWorkout.estimatedDuration,
        metrics: parsedWorkout.metrics
      }

      setWorkouts(prev => [newWorkout, ...prev])
      return newWorkout
    } catch (error) {
      console.error('Error logging workout:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getAIInsights = async () => {
    try {
      return await openaiService.generateInsights(workouts, subscriptionTier)
    } catch (error) {
      console.error('Error getting AI insights:', error)
      return null
    }
  }

  const generateWorkoutPlan = async (userGoals, fitnessLevel, availableTime) => {
    try {
      return await openaiService.generateWorkoutPlan(userGoals, fitnessLevel, availableTime, subscriptionTier)
    } catch (error) {
      console.error('Error generating workout plan:', error)
      throw error
    }
  }

  const analyzeForm = async (exerciseType, userDescription) => {
    try {
      return await openaiService.analyzeFormFeedback(exerciseType, userDescription, subscriptionTier)
    } catch (error) {
      console.error('Error analyzing form:', error)
      throw error
    }
  }

  const getNutritionAdvice = async (userGoals) => {
    try {
      return await openaiService.generateNutritionAdvice(workouts, userGoals, subscriptionTier)
    } catch (error) {
      console.error('Error getting nutrition advice:', error)
      throw error
    }
  }

  const predictPerformance = async (targetExercise) => {
    try {
      return await openaiService.predictPerformance(workouts, targetExercise, subscriptionTier)
    } catch (error) {
      console.error('Error predicting performance:', error)
      throw error
    }
  }

  const upgradeSubscription = async (tier) => {
    setLoading(true)
    try {
      // In demo mode, use demo upgrade
      if (import.meta.env.DEV || !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        const result = await stripeService.demoUpgrade(tier)
        setSubscriptionTier(tier)
        toast.success(result.message)
        return result
      }

      // In production, use real Stripe checkout
      const priceId = stripeService.priceIds[`${tier}_monthly`]
      await stripeService.createCheckoutSession(priceId, user.userId)
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      toast.error('Failed to upgrade subscription. Please try again.')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const cancelSubscription = async () => {
    setLoading(true)
    try {
      // In demo mode, use demo cancellation
      if (import.meta.env.DEV || !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        const result = await stripeService.demoCancel()
        setSubscriptionTier('free')
        toast.success(result.message)
        return result
      }

      // In production, redirect to Stripe customer portal
      await stripeService.createPortalSession(user.stripeCustomerId)
    } catch (error) {
      console.error('Error canceling subscription:', error)
      toast.error('Failed to cancel subscription. Please try again.')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const saveWorkoutToDatabase = async (workout) => {
    try {
      return await supabaseService.saveWorkout(workout)
    } catch (error) {
      console.error('Error saving workout to database:', error)
      // Fallback to local state only
      return workout
    }
  }

  const loadWorkoutsFromDatabase = async () => {
    try {
      const dbWorkouts = await supabaseService.getWorkouts(user.userId)
      if (dbWorkouts.length > 0) {
        setWorkouts(dbWorkouts)
      }
    } catch (error) {
      console.error('Error loading workouts from database:', error)
      // Continue with demo data
    }
  }

  const value = {
    user,
    workouts,
    loading,
    subscriptionTier,
    setSubscriptionTier,
    logWorkout,
    getAIInsights,
    generateWorkoutPlan,
    analyzeForm,
    getNutritionAdvice,
    predictPerformance,
    upgradeSubscription,
    cancelSubscription,
    saveWorkoutToDatabase,
    loadWorkoutsFromDatabase
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
