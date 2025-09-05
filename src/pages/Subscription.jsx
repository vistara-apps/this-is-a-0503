import React, { useState } from 'react'
import { useAppContext } from '../contexts/AppContext'
import DashboardCard from '../components/DashboardCard'
import { Crown, Check, Zap, TrendingUp, Brain, Star } from 'lucide-react'
import toast from 'react-hot-toast'

const Subscription = () => {
  const { subscriptionTier, upgradeSubscription, cancelSubscription, loading } = useAppContext()
  const [localLoading, setLocalLoading] = useState(false)

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started with AI-powered fitness tracking',
      features: [
        'Basic workout logging',
        'Simple progress tracking',
        'Up to 10 workouts per month',
        'Basic AI exercise recognition'
      ],
      icon: Zap,
      popular: false
    },
    {
      id: 'core',
      name: 'Core',
      price: '$5',
      period: 'month',
      description: 'Essential features for serious fitness enthusiasts',
      features: [
        'Unlimited workout logging',
        'Advanced progress analytics',
        'AI workout insights',
        'Performance trend analysis',
        'Export workout data',
        'Email support'
      ],
      icon: TrendingUp,
      popular: true
    },
    {
      id: 'advanced',
      name: 'Advanced',
      price: '$15',
      period: 'month',
      description: 'Complete AI coaching and premium analytics',
      features: [
        'Everything in Core',
        'Personalized AI coaching',
        'Advanced predictive analytics',
        'Custom workout recommendations',
        'Injury prevention insights',
        'Priority support',
        'Beta feature access'
      ],
      icon: Brain,
      popular: false
    }
  ]

  const handleUpgrade = async (planId) => {
    try {
      await upgradeSubscription(planId)
    } catch (error) {
      // Error handling is done in the context
    }
  }

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      try {
        await cancelSubscription()
      } catch (error) {
        // Error handling is done in the context
      }
    }
  }

  const currentPlan = plans.find(p => p.id === subscriptionTier)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in text-center">
        <h1 className="text-3xl font-bold text-text mb-2">Choose Your Plan</h1>
        <p className="text-muted">Unlock the full potential of AI-powered fitness tracking</p>
      </div>

      {/* Current Plan Status */}
      {currentPlan && (
        <DashboardCard variant="metricHighlight" className="animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-text">Current Plan: {currentPlan.name}</h3>
                <p className="text-muted">
                  {currentPlan.id === 'free' ? 'Free forever' : `${currentPlan.price}/${currentPlan.period}`}
                </p>
              </div>
            </div>
            <div className="flex items-center text-green-600">
              <Check className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Active</span>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const Icon = plan.icon
          const isCurrentPlan = subscriptionTier === plan.id
          const canUpgrade = plan.id !== 'free' && !isCurrentPlan
          
          return (
            <DashboardCard 
              key={plan.id}
              className={`relative animate-slide-up ${plan.popular ? 'ring-2 ring-primary' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                
                <h3 className="text-xl font-bold text-text mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-text">{plan.price}</span>
                  {plan.id !== 'free' && (
                    <span className="text-muted">/{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-6 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-text">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => canUpgrade && handleUpgrade(plan.id)}
                  disabled={isCurrentPlan || loading}
                  className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-gray-100 text-text hover:bg-gray-200'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : canUpgrade ? `Upgrade to ${plan.name}` : 'Free Plan'}
                </button>
              </div>
            </DashboardCard>
          )
        })}
      </div>

      {/* Cancel Subscription */}
      {subscriptionTier !== 'free' && (
        <DashboardCard className="animate-slide-up border-red-200" style={{ animationDelay: '350ms' }}>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text mb-2">Manage Subscription</h3>
            <p className="text-muted mb-4">
              Need to make changes to your subscription? You can cancel anytime.
            </p>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Cancel Subscription'}
            </button>
          </div>
        </DashboardCard>
      )}

      {/* Feature Comparison */}
      <DashboardCard className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h3 className="text-lg font-semibold text-text mb-4">Why Upgrade?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-text mb-3 flex items-center">
              <Brain className="h-4 w-4 text-primary mr-2" />
              Advanced AI Features
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>• Personalized workout recommendations</li>
              <li>• Performance prediction analytics</li>
              <li>• Injury prevention insights</li>
              <li>• Smart progress optimization</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-text mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 text-accent mr-2" />
              Premium Analytics
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>• Detailed progress tracking</li>
              <li>• Performance trend analysis</li>
              <li>• Custom workout insights</li>
              <li>• Export and share data</li>
            </ul>
          </div>
        </div>
      </DashboardCard>

      {/* FAQ */}
      <DashboardCard className="animate-slide-up" style={{ animationDelay: '500ms' }}>
        <h3 className="text-lg font-semibold text-text mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-text mb-1">Can I cancel anytime?</h4>
            <p className="text-sm text-muted">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
          </div>
          <div>
            <h4 className="font-medium text-text mb-1">What payment methods do you accept?</h4>
            <p className="text-sm text-muted">We accept all major credit cards, PayPal, and Apple Pay through our secure payment processor.</p>
          </div>
          <div>
            <h4 className="font-medium text-text mb-1">Is my data secure?</h4>
            <p className="text-sm text-muted">Absolutely. We use enterprise-grade encryption and never share your personal fitness data with third parties.</p>
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}

export default Subscription
