import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: 'sk-placeholder-key', // Replace with actual API key
  baseURL: "https://openrouter.ai/api/v1",
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

  async generateInsights(workouts) {
    if (!workouts || workouts.length === 0) {
      return "Start logging workouts to get personalized AI insights!"
    }

    try {
      const workoutSummary = workouts.slice(0, 10).map(w => 
        `${w.exerciseType}: ${JSON.stringify(w.metrics)}`
      ).join('\n')

      const response = await openai.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: `You are a fitness coach AI. Analyze workout data and provide encouraging, actionable insights.
            
            Focus on:
            - Progress trends
            - Areas for improvement
            - Motivation and encouragement
            - Specific recommendations
            
            Keep it concise, positive, and actionable.`
          },
          {
            role: 'user',
            content: `Analyze these recent workouts and provide insights:\n\n${workoutSummary}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })

      return response.choices[0].message.content
    } catch (error) {
      console.error('Error generating insights:', error)
      return "Great job staying consistent with your workouts! Keep up the momentum and focus on progressive overload to see continued improvements."
    }
  }
}