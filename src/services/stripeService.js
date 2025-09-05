import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

export const stripeService = {
  // Get Stripe instance
  async getStripe() {
    return await stripePromise
  },

  // Create checkout session for subscription
  async createCheckoutSession(priceId, userId, successUrl, cancelUrl) {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          successUrl: successUrl || `${window.location.origin}/subscription?success=true`,
          cancelUrl: cancelUrl || `${window.location.origin}/subscription?canceled=true`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      
      const stripe = await this.getStripe()
      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  },

  // Create customer portal session
  async createPortalSession(customerId, returnUrl) {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: returnUrl || `${window.location.origin}/subscription`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating portal session:', error)
      throw error
    }
  },

  // Get subscription status
  async getSubscriptionStatus(userId) {
    try {
      const response = await fetch(`/api/stripe/subscription-status/${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to get subscription status')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting subscription status:', error)
      return { status: 'inactive', tier: 'free' }
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      return await response.json()
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  },

  // Price IDs for different subscription tiers
  priceIds: {
    core_monthly: 'price_core_monthly_placeholder',
    core_yearly: 'price_core_yearly_placeholder',
    advanced_monthly: 'price_advanced_monthly_placeholder',
    advanced_yearly: 'price_advanced_yearly_placeholder',
  },

  // Demo mode functions for development
  async demoUpgrade(tier) {
    // Simulate successful upgrade in demo mode
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          tier,
          message: `Successfully upgraded to ${tier} plan (Demo Mode)`
        })
      }, 1000)
    })
  },

  async demoCancel() {
    // Simulate successful cancellation in demo mode
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          tier: 'free',
          message: 'Successfully canceled subscription (Demo Mode)'
        })
      }, 1000)
    })
  }
}
