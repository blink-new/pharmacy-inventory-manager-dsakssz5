import { useState, useEffect } from 'react'
import { Drug, SubstitutionSuggestion } from '../types/pharmacy'
import { SubstitutionEngine } from '../services/substitutionEngine'
import { DrugCard } from './DrugCard'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { AlertTriangle, CheckCircle, Info, Zap, ArrowRight, X } from 'lucide-react'

interface SubstitutionPanelProps {
  targetDrug: Drug | null
  allDrugs: Drug[]
  onClose: () => void
  onSelectSubstitute: (drug: Drug) => void
}

export function SubstitutionPanel({ 
  targetDrug, 
  allDrugs, 
  onClose, 
  onSelectSubstitute 
}: SubstitutionPanelProps) {
  const [suggestions, setSuggestions] = useState<SubstitutionSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [showUnavailable, setShowUnavailable] = useState(false)

  useEffect(() => {
    if (!targetDrug) {
      setSuggestions([])
      return
    }

    setLoading(true)
    
    // Simulate slight delay for better UX
    setTimeout(() => {
      const engine = new SubstitutionEngine(allDrugs)
      const availableSuggestions = engine.findSubstitutes(targetDrug, !showUnavailable)
      setSuggestions(availableSuggestions)
      setLoading(false)
    }, 300)
  }, [targetDrug, allDrugs, showUnavailable])

  if (!targetDrug) return null

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'exact': return 'bg-green-100 text-green-800 border-green-200'
      case 'equivalent': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'similar': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'exact': return <CheckCircle className="h-4 w-4" />
      case 'equivalent': return <Zap className="h-4 w-4" />
      case 'similar': return <Info className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 70) return 'text-blue-600'
    if (confidence >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-sky-50 border-b border-sky-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="h-6 w-6 text-sky-600" />
                Smart Substitution System
              </h2>
              <p className="text-gray-600 mt-1">
                Finding alternatives for <span className="font-semibold">{targetDrug.name}</span>
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Target Drug Info */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Medication</h3>
            <DrugCard drug={targetDrug} showSubstitutes />
            
            <div className="mt-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Search Criteria</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Molecule:</span>
                    <span className="font-medium">{targetDrug.activeMolecule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dosage:</span>
                    <span className="font-medium">{targetDrug.dosage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Form:</span>
                    <span className="font-medium">{targetDrug.dosageForm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{targetDrug.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Show unavailable items
                </label>
                <Button
                  variant={showUnavailable ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowUnavailable(!showUnavailable)}
                >
                  {showUnavailable ? 'Hide' : 'Show'}
                </Button>
              </div>
            </div>
          </div>

          {/* Substitution Results */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Substitution Suggestions ({suggestions.length})
              </h3>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-sky-600 border-t-transparent"></div>
                  Analyzing alternatives...
                </div>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Substitutes Found</h4>
                <p className="text-gray-600 mb-4">
                  No suitable alternatives were found for this medication.
                </p>
                <Button variant="outline" onClick={() => setShowUnavailable(true)}>
                  Show Unavailable Items
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <Card key={suggestion.drug.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline" 
                            className={`${getMatchTypeColor(suggestion.matchType)} flex items-center gap-1`}
                          >
                            {getMatchTypeIcon(suggestion.matchType)}
                            {suggestion.matchType.charAt(0).toUpperCase() + suggestion.matchType.slice(1)} Match
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Confidence:</span>
                            <span className={`font-bold ${getConfidenceColor(suggestion.confidence)}`}>
                              {suggestion.confidence}%
                            </span>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => onSelectSubstitute(suggestion.drug)}
                          className="flex items-center gap-2"
                        >
                          Select <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Drug Card */}
                        <div>
                          <DrugCard drug={suggestion.drug} />
                        </div>

                        {/* Substitution Details */}
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Substitution Reason</h5>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                              {suggestion.reason}
                            </p>
                          </div>

                          {suggestion.dosageAdjustment && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Dosage Adjustment</h5>
                              <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded border border-blue-200">
                                <Info className="h-4 w-4 inline mr-2" />
                                {suggestion.dosageAdjustment}
                              </p>
                            </div>
                          )}

                          {suggestion.warnings && suggestion.warnings.length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Warnings</h5>
                              <div className="space-y-2">
                                {suggestion.warnings.map((warning, idx) => (
                                  <p key={idx} className="text-sm text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    {warning}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Comparison */}
                          <div className="bg-gray-50 p-3 rounded">
                            <h5 className="font-medium text-gray-900 mb-2">Quick Comparison</h5>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-gray-600">Original:</span>
                                <p className="font-medium">{targetDrug.activeMolecule} {targetDrug.dosage}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Substitute:</span>
                                <p className="font-medium">{suggestion.drug.activeMolecule} {suggestion.drug.dosage}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}