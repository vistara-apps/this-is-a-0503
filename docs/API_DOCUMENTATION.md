# FitFlow AI - API Documentation

## Overview

FitFlow AI integrates with multiple external APIs to provide comprehensive fitness tracking and AI-powered insights. This document outlines all API integrations, endpoints, and implementation details.

## Table of Contents

1. [OpenAI API Integration](#openai-api-integration)
2. [Supabase API Integration](#supabase-api-integration)
3. [Stripe API Integration](#stripe-api-integration)
4. [Environment Configuration](#environment-configuration)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Security Considerations](#security-considerations)

## OpenAI API Integration

### Purpose
Powers AI-driven exercise recognition, workout insights, form analysis, and personalized recommendations.

### Configuration
```javascript
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  baseURL: import.meta.env.VITE_OPENAI_BASE_URL || "https://api.openai.com/v1",
  dangerouslyAllowBrowser: true,
})
```

### Endpoints Used

#### 1. Chat Completions
- **Endpoint**: `/v1/chat/completions`
- **Method**: POST
- **Model**: `google/gemini-2.0-flash-001` (via OpenRouter) or `gpt-3.5-turbo`

### API Methods

#### `parseWorkout(description)`
Parses natural language workout descriptions into structured data.

**Parameters:**
- `description` (string): Natural language workout description

**Returns:**
```javascript
{
  exerciseType: string,
  estimatedDuration: number, // minutes
  metrics: {
    sets?: number,
    reps?: number,
    weight?: number,
    distance?: number,
    pace?: string,
    calories?: number
  }
}
```

**Example Usage:**
```javascript
const workout = await openaiService.parseWorkout("3 sets of 10 push-ups")
// Returns: { exerciseType: "Push-ups", estimatedDuration: 15, metrics: { sets: 3, reps: 10, weight: 0 } }
```

#### `generateInsights(workouts, subscriptionTier)`
Generates personalized fitness insights based on workout history.

**Parameters:**
- `workouts` (array): Array of workout objects
- `subscriptionTier` (string): User's subscription level ('free', 'core', 'advanced')

**Returns:** String with AI-generated insights

**Subscription Tiers:**
- **Free**: Basic insights (300 tokens max)
- **Core/Advanced**: Detailed insights with specific recommendations (500 tokens max)

#### `generateWorkoutPlan(userGoals, fitnessLevel, availableTime, subscriptionTier)`
Creates personalized workout plans (Core/Advanced only).

**Parameters:**
- `userGoals` (string): User's fitness objectives
- `fitnessLevel` (string): 'beginner', 'intermediate', 'advanced'
- `availableTime` (number): Minutes available per session
- `subscriptionTier` (string): Subscription level

**Returns:** String with structured workout plan

#### `analyzeFormFeedback(exerciseType, userDescription, subscriptionTier)`
Provides form analysis and corrections (Advanced only).

**Parameters:**
- `exerciseType` (string): Name of the exercise
- `userDescription` (string): User's form description
- `subscriptionTier` (string): Must be 'advanced'

**Returns:** String with form analysis and corrections

#### `generateNutritionAdvice(workouts, userGoals, subscriptionTier)`
Provides nutrition recommendations (Advanced only).

**Parameters:**
- `workouts` (array): Recent workout history
- `userGoals` (string): User's fitness goals
- `subscriptionTier` (string): Must be 'advanced'

**Returns:** String with nutrition advice

#### `predictPerformance(workouts, targetExercise, subscriptionTier)`
Predicts future performance capabilities (Advanced only).

**Parameters:**
- `workouts` (array): Historical workout data
- `targetExercise` (string): Exercise to predict performance for
- `subscriptionTier` (string): Must be 'advanced'

**Returns:** String with performance predictions

### Error Handling
All OpenAI methods include fallback mechanisms:
- Network errors fall back to local parsing/default responses
- API rate limits trigger graceful degradation
- Invalid responses use fallback parsing logic

## Supabase API Integration

### Purpose
Provides backend-as-a-service for user authentication, data storage, and real-time synchronization.

### Configuration
```javascript
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Database Schema

#### Users Table (`user_profiles`)
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
```

#### Workouts Table (`workouts`)
```sql
CREATE TABLE workouts (
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
```

#### Exercises Table (`exercises`)
```sql
CREATE TABLE exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  muscle_groups TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Methods

#### Authentication
- `signUp(email, password, userData)`: Create new user account
- `signIn(email, password)`: Authenticate user
- `signOut()`: Sign out current user
- `getCurrentUser()`: Get current authenticated user

#### Workout Management
- `saveWorkout(workout)`: Save workout to database
- `getWorkouts(userId, limit)`: Retrieve user's workouts
- `deleteWorkout(workoutId)`: Delete specific workout

#### User Profile Management
- `updateUserProfile(userId, updates)`: Update user profile
- `getUserProfile(userId)`: Get user profile data

#### Exercise Library
- `getExercises()`: Get available exercises
- `getDefaultExercises()`: Get fallback exercise list

#### Real-time Features
- `subscribeToWorkouts(userId, callback)`: Subscribe to workout changes

### Local Storage Fallbacks
For demo mode or when Supabase is unavailable:
- `saveWorkoutLocal(workout)`: Save to localStorage
- `getWorkoutsLocal(userId)`: Retrieve from localStorage

## Stripe API Integration

### Purpose
Handles subscription payments, customer management, and billing.

### Configuration
```javascript
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
```

### Price IDs
```javascript
priceIds: {
  core_monthly: 'price_core_monthly_placeholder',
  core_yearly: 'price_core_yearly_placeholder',
  advanced_monthly: 'price_advanced_monthly_placeholder',
  advanced_yearly: 'price_advanced_yearly_placeholder',
}
```

### API Methods

#### `createCheckoutSession(priceId, userId, successUrl, cancelUrl)`
Creates Stripe checkout session for subscription.

**Parameters:**
- `priceId` (string): Stripe price ID
- `userId` (string): User identifier
- `successUrl` (string): Redirect URL on success
- `cancelUrl` (string): Redirect URL on cancellation

**Backend Endpoint:** `POST /api/stripe/create-checkout-session`

#### `createPortalSession(customerId, returnUrl)`
Creates customer portal session for subscription management.

**Parameters:**
- `customerId` (string): Stripe customer ID
- `returnUrl` (string): Return URL after portal session

**Backend Endpoint:** `POST /api/stripe/create-portal-session`

#### `getSubscriptionStatus(userId)`
Retrieves current subscription status.

**Backend Endpoint:** `GET /api/stripe/subscription-status/:userId`

#### `cancelSubscription(subscriptionId)`
Cancels active subscription.

**Backend Endpoint:** `POST /api/stripe/cancel-subscription`

### Demo Mode Methods
For development/demo purposes:
- `demoUpgrade(tier)`: Simulates subscription upgrade
- `demoCancel()`: Simulates subscription cancellation

## Environment Configuration

### Required Environment Variables

```bash
# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_OPENAI_BASE_URL=https://api.openai.com/v1

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# App Configuration
VITE_APP_NAME=FitFlow AI
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=http://localhost:3000/api

# Development
NODE_ENV=development
VITE_DEBUG=true
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in actual API keys and URLs
3. Ensure all services are properly configured

## Error Handling

### OpenAI API Errors
```javascript
try {
  const result = await openaiService.parseWorkout(description)
} catch (error) {
  // Falls back to local parsing
  console.error('OpenAI API error:', error)
  return fallbackParse(description)
}
```

### Supabase Errors
```javascript
try {
  const workout = await supabaseService.saveWorkout(workoutData)
} catch (error) {
  // Falls back to localStorage
  console.error('Supabase error:', error)
  return saveWorkoutLocal(workoutData)
}
```

### Stripe Errors
```javascript
try {
  await stripeService.createCheckoutSession(priceId, userId)
} catch (error) {
  console.error('Stripe error:', error)
  toast.error('Payment processing failed. Please try again.')
}
```

## Rate Limiting

### OpenAI API
- **Rate Limit**: Varies by plan and model
- **Handling**: Exponential backoff with fallback responses
- **Monitoring**: Track usage to prevent overages

### Supabase
- **Rate Limit**: Based on plan (free tier: 500 requests/second)
- **Handling**: Queue requests and implement retry logic
- **Real-time**: Connection limits apply

### Stripe
- **Rate Limit**: 100 requests/second in live mode
- **Handling**: Built-in retry logic in Stripe SDK
- **Webhooks**: Separate rate limits apply

## Security Considerations

### API Key Management
- Store sensitive keys in environment variables
- Use different keys for development/production
- Rotate keys regularly
- Never commit keys to version control

### Client-Side Security
- OpenAI API key exposed to client (necessary for browser usage)
- Use API key restrictions when possible
- Monitor usage for abuse

### Data Protection
- All API communications use HTTPS
- Supabase handles data encryption at rest
- Stripe is PCI DSS compliant
- Implement proper authentication checks

### CORS Configuration
```javascript
// Supabase CORS settings
const corsOptions = {
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}
```

## Testing

### API Testing
```javascript
// Test OpenAI integration
describe('OpenAI Service', () => {
  test('should parse workout description', async () => {
    const result = await openaiService.parseWorkout('10 push-ups')
    expect(result.exerciseType).toBe('Push-ups')
  })
})

// Test Supabase integration
describe('Supabase Service', () => {
  test('should save workout', async () => {
    const workout = { /* workout data */ }
    const result = await supabaseService.saveWorkout(workout)
    expect(result.workoutId).toBeDefined()
  })
})
```

### Mock Services
For testing without API calls:
```javascript
// Mock OpenAI service
const mockOpenAIService = {
  parseWorkout: jest.fn().mockResolvedValue({
    exerciseType: 'Push-ups',
    estimatedDuration: 15,
    metrics: { sets: 3, reps: 10 }
  })
}
```

## Deployment Considerations

### Production Setup
1. Configure production API keys
2. Set up proper CORS policies
3. Implement monitoring and logging
4. Set up error tracking (e.g., Sentry)
5. Configure CDN for static assets

### Monitoring
- Track API usage and costs
- Monitor error rates and response times
- Set up alerts for service disruptions
- Log user actions for analytics

### Scaling
- Implement caching for frequently accessed data
- Use connection pooling for database
- Consider API rate limiting on backend
- Implement proper error boundaries in React

## Support and Troubleshooting

### Common Issues
1. **API Key Errors**: Verify keys are correctly set in environment
2. **CORS Issues**: Check domain whitelist in API configurations
3. **Rate Limiting**: Implement proper retry logic and user feedback
4. **Network Errors**: Provide offline functionality where possible

### Debug Mode
Enable debug logging:
```javascript
if (import.meta.env.VITE_DEBUG) {
  console.log('API Request:', requestData)
  console.log('API Response:', responseData)
}
```

### Contact Information
- OpenAI Support: https://help.openai.com/
- Supabase Support: https://supabase.com/support
- Stripe Support: https://support.stripe.com/
