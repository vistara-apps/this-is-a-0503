import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'sk-placeholder-key',
  baseURL: import.meta.env.VITE_OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
})

export const openaiService = {
  async parseWorkout(description) {
    try {
      const response = await openai.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: `You are a fitness expert AI. Parse workout descriptions and return structured data.
            
            Return a JSON object with:
            - exerciseType: string (e.g., "Push-ups", "Bench Press", "Running")
            - estimatedDuration: number (in minutes)
            - metrics: object with relevant metrics (sets, reps, weight, distance, etc.)
            
            For strength exercises: sets, reps, weight (if mentioned)
            For cardio: distance, duration, pace (if mentioned)
            
            Be smart about inferring missing data based on typical workout patterns.`
          },
          {
            role: 'user',
            content: description
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      })

      const content = response.choices[0].message.content
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      // Fallback parsing if AI doesn't return proper JSON
      return this.fallbackParse(description)
    } catch (error) {
      console.error('OpenAI API error:', error)
      return this.fallbackParse(description)
    }
  },

  fallbackParse(description) {
    // Simple fallback parsing logic
    const lowerDesc = description.toLowerCase()
    
    if (lowerDesc.includes('push') || lowerDesc.includes('pushup')) {
      return {
        exerciseType: 'Push-ups',
        estimatedDuration: 15,
        metrics: { sets: 3, reps: 10, weight: 0 }
      }
    }
    
    if (lowerDesc.includes('squat')) {
      return {
        exerciseType: 'Squats',
        estimatedDuration: 20,
        metrics: { sets: 3, reps: 15, weight: 0 }
      }
    }
    
    if (lowerDesc.includes('run') || lowerDesc.includes('jog')) {
      return {
        exerciseType: 'Running',
        estimatedDuration: 30,
        metrics: { distance: 3, pace: '10:00', calories: 300 }
      }
    }
    
    // Default
    return {
      exerciseType: 'General Exercise',
      estimatedDuration: 20,
      metrics: { notes: description }
    }
  },

  async generateInsights(workouts, subscriptionTier = 'free') {
    if (!workouts || workouts.length === 0) {
      return "Start logging workouts to get personalized AI insights!"
    }

    try {
      const workoutSummary = workouts.slice(0, 10).map(w => 
        `${w.exerciseType}: ${JSON.stringify(w.metrics)} (${new Date(w.startTime).toLocaleDateString()})`
      ).join('\n')

      const systemPrompt = subscriptionTier === 'advanced' 
        ? `You are an expert fitness coach AI with advanced analytics capabilities. Provide detailed, personalized insights with specific recommendations, form tips, and progressive training plans.

        Advanced Analysis Features:
        - Detailed progress tracking and trend analysis
        - Specific form and technique recommendations
        - Periodization and training cycle suggestions
        - Injury prevention advice
        - Nutrition timing recommendations
        - Recovery optimization strategies
        
        Provide comprehensive, actionable insights with specific metrics and targets.`
        : `You are a fitness coach AI. Analyze workout data and provide encouraging, actionable insights.
        
        Focus on:
        - Progress trends
        - Areas for improvement
        - Motivation and encouragement
        - Specific recommendations
        
        Keep it concise, positive, and actionable.`

      const response = await openai.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Analyze these recent workouts and provide insights:\n\n${workoutSummary}`
          }
        ],
        temperature: 0.7,
        max_tokens: subscriptionTier === 'advanced' ? 500 : 300
      })

      return response.choices[0].message.content
    } catch (error) {
      console.error('Error generating insights:', error)
      return "Great job staying consistent with your workouts! Keep up the momentum and focus on progressive overload to see continued improvements."
    }
  },

  async generateWorkoutPlan(userGoals, fitnessLevel, availableTime, subscriptionTier = 'free') {
    if (subscriptionTier === 'free') {
      return "Upgrade to Core or Advanced plan to get personalized AI workout plans!"
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: `You are a professional fitness trainer AI. Create personalized workout plans based on user goals, fitness level, and available time.

            Provide structured workout plans with:
            - Specific exercises with sets, reps, and rest periods
            - Progressive overload recommendations
            - Warm-up and cool-down routines
            - Modification options for different fitness levels
            - Safety considerations and form tips

            Format as a structured plan with clear sections.`
          },
          {
            role: 'user',
            content: `Create a workout plan for:
            Goals: ${userGoals}
            Fitness Level: ${fitnessLevel}
            Available Time: ${availableTime} minutes per session
            Subscription: ${subscriptionTier}`
          }
        ],
        temperature: 0.6,
        max_tokens: subscriptionTier === 'advanced' ? 800 : 500
      })

      return response.choices[0].message.content
    } catch (error) {
      console.error('Error generating workout plan:', error)
      return "Unable to generate workout plan at this time. Please try again later."
    }
  },

  async analyzeFormFeedback(exerciseType, userDescription, subscriptionTier = 'free') {
    if (subscriptionTier !== 'advanced') {
      return "Upgrade to Advanced plan to get AI form analysis and feedback!"
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: `You are a certified personal trainer AI specializing in exercise form analysis. Provide detailed form feedback and corrections based on user descriptions.

            Focus on:
            - Common form mistakes for the exercise
            - Specific corrections and cues
            - Safety considerations
            - Progressive improvements
            - Injury prevention tips

            Be encouraging but precise with technical feedback.`
          },
          {
            role: 'user',
            content: `Analyze form for ${exerciseType}. User description: "${userDescription}"`
          }
        ],
        temperature: 0.4,
        max_tokens: 400
      })

      return response.choices[0].message.content
    } catch (error) {
      console.error('Error analyzing form feedback:', error)
      return "Unable to analyze form at this time. Please try again later."
    }
  },

  async generateNutritionAdvice(workouts, userGoals, subscriptionTier = 'free') {
    if (subscriptionTier !== 'advanced') {
      return "Upgrade to Advanced plan to get personalized nutrition advice!"
    }

    try {
      const workoutTypes = workouts.slice(0, 5).map(w => w.exerciseType).join(', ')
      
      const response = await openai.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: `You are a sports nutritionist AI. Provide personalized nutrition advice based on workout patterns and fitness goals.

            Focus on:
            - Pre and post-workout nutrition
            - Macronutrient timing
            - Hydration strategies
            - Recovery nutrition
            - Supplement recommendations (if appropriate)

            Keep advice practical and evidence-based.`
          },
          {
            role: 'user',
            content: `Provide nutrition advice for someone doing: ${workoutTypes}. Goals: ${userGoals}`
          }
        ],
        temperature: 0.5,
        max_tokens: 400
      })

      return response.choices[0].message.content
    } catch (error) {
      console.error('Error generating nutrition advice:', error)
      return "Unable to generate nutrition advice at this time. Please try again later."
    }
  },

  async predictPerformance(workouts, targetExercise, subscriptionTier = 'free') {
    if (subscriptionTier !== 'advanced') {
      return "Upgrade to Advanced plan to get AI performance predictions!"
    }

    try {
      const relevantWorkouts = workouts
        .filter(w => w.exerciseType.toLowerCase().includes(targetExercise.toLowerCase()))
        .slice(0, 10)

      if (relevantWorkouts.length < 3) {
        return "Need more workout data for accurate performance predictions. Keep logging your workouts!"
      }

      const workoutData = relevantWorkouts.map(w => 
        `${w.exerciseType}: ${JSON.stringify(w.metrics)} (${new Date(w.startTime).toLocaleDateString()})`
      ).join('\n')

      const response = await openai.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: `You are a sports performance analyst AI. Analyze workout progression data and predict future performance capabilities.

            Provide:
            - Performance trend analysis
            - Realistic short-term goals (1-4 weeks)
            - Medium-term projections (1-3 months)
            - Factors that could affect performance
            - Specific metrics to track

            Base predictions on actual data trends and be realistic.`
          },
          {
            role: 'user',
            content: `Analyze performance trends and predict future capabilities for ${targetExercise}:\n\n${workoutData}`
          }
        ],
        temperature: 0.3,
        max_tokens: 400
      })

      return response.choices[0].message.content
    } catch (error) {
      console.error('Error predicting performance:', error)
      return "Unable to generate performance predictions at this time. Please try again later."
    }
  }
}
