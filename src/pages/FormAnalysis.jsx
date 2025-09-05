import React, { useState } from 'react'
import { useAppContext } from '../contexts/AppContext'
import DashboardCard from '../components/DashboardCard'
import { Eye, AlertTriangle, CheckCircle, Crown, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const FormAnalysis = () => {
  const { analyzeForm, subscriptionTier, loading } = useAppContext()
  const [formData, setFormData] = useState({
    exerciseType: '',
    description: ''
  })
  const [analysis, setAnalysis] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const commonExercises = [
    'Push-ups', 'Squats', 'Deadlift', 'Bench Press', 'Pull-ups',
    'Overhead Press', 'Rows', 'Lunges', 'Plank', 'Burpees'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()
    
    if (!formData.exerciseType.trim() || !formData.description.trim()) {
      toast.error('Please fill in both exercise type and description')
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await analyzeForm(formData.exerciseType, formData.description)
      setAnalysis(result)
      
      if (subscriptionTier !== 'advanced') {
        toast.info('Upgrade to Advanced plan for detailed form analysis!')
      } else {
        toast.success('Form analysis completed!')
      }
    } catch (error) {
      toast.error('Failed to analyze form')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const isAdvancedFeature = subscriptionTier !== 'advanced'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-text mb-2 flex items-center">
          <Eye className="h-8 w-8 text-primary mr-3" />
          AI Form Analysis
        </h1>
        <p className="text-muted">Get expert feedback on your exercise form and technique</p>
      </div>

      {/* Advanced Feature Notice */}
      {isAdvancedFeature && (
        <DashboardCard className="animate-slide-up border-purple-200 bg-purple-50">
          <div className="flex items-start">
            <Crown className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-800 mb-1">Advanced Feature</h3>
              <p className="text-purple-700 text-sm">
                Upgrade to Advanced plan to get detailed AI form analysis with personalized corrections and safety tips from certified trainer expertise.
              </p>
            </div>
          </div>
        </DashboardCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Analysis Input */}
        <DashboardCard className="animate-slide-up">
          <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            Exercise Form Check
          </h2>
          
          <form onSubmit={handleAnalyze} className="space-y-4">
            {/* Exercise Type */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Exercise Type
              </label>
              <input
                type="text"
                name="exerciseType"
                value={formData.exerciseType}
                onChange={handleInputChange}
                placeholder="e.g., Push-ups, Squats, Deadlift..."
                className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              
              {/* Quick Select Buttons */}
              <div className="mt-2 flex flex-wrap gap-2">
                {commonExercises.map((exercise) => (
                  <button
                    key={exercise}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, exerciseType: exercise }))}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200"
                  >
                    {exercise}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Description */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Describe Your Form
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe how you perform the exercise, any issues you're experiencing, or specific areas you'd like feedback on..."
                className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={6}
                required
              />
              <p className="text-xs text-muted mt-1">
                Be as detailed as possible for better analysis
              </p>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || loading}
              className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing Form...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Analyze Form
                </>
              )}
            </button>
          </form>
        </DashboardCard>

        {/* Analysis Results */}
        <DashboardCard className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            Form Analysis Results
          </h2>
          
          {analysis ? (
            <div className="prose prose-sm max-w-none">
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm text-text font-sans">
                  {analysis}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted">
                Describe your exercise form above and click "Analyze Form" to get expert feedback
              </p>
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Form Analysis Tips */}
      <DashboardCard className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h3 className="text-lg font-semibold text-text mb-4">How to Get Better Form Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-text mb-3 flex items-center">
              <AlertCircle className="h-4 w-4 text-blue-500 mr-2" />
              Be Specific
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>• Describe your starting position</li>
              <li>• Mention the movement pattern</li>
              <li>• Note any pain or discomfort</li>
              <li>• Include your experience level</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-text mb-3 flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              What You'll Get
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>• Common mistake identification</li>
              <li>• Specific correction cues</li>
              <li>• Safety considerations</li>
              <li>• Progressive improvement tips</li>
            </ul>
          </div>
        </div>
      </DashboardCard>

      {/* Example Analysis */}
      <DashboardCard className="animate-slide-up" style={{ animationDelay: '600ms' }}>
        <h3 className="text-lg font-semibold text-text mb-4">Example Form Analysis</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="mb-3">
            <span className="font-medium text-text">Exercise:</span> Push-ups
          </div>
          <div className="mb-3">
            <span className="font-medium text-text">User Description:</span> "I feel strain in my lower back during push-ups and my arms get tired quickly."
          </div>
          <div className="border-l-4 border-primary pl-4">
            <span className="font-medium text-text">AI Analysis:</span>
            <p className="text-sm text-muted mt-1">
              "The lower back strain suggests your core isn't properly engaged and your hips may be sagging. Focus on maintaining a straight line from head to heels by tightening your core muscles. The quick arm fatigue indicates you might be placing your hands too wide or too far forward..."
            </p>
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}

export default FormAnalysis
