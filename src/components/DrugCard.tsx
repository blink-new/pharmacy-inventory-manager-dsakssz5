import { Drug } from '../types/pharmacy'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { AlertTriangle, Package, Pill, ShieldCheck, Edit } from 'lucide-react'

interface DrugCardProps {
  drug: Drug
  onClick?: () => void
  onEdit?: () => void
  showSubstitutes?: boolean
}

export function DrugCard({ drug, onClick, onEdit, showSubstitutes = false }: DrugCardProps) {
  const getStockStatus = () => {
    if (drug.stockLevel === 0) return 'out'
    if (drug.stockLevel <= drug.minStockLevel) return 'low'
    if (drug.stockLevel >= drug.maxStockLevel * 0.8) return 'high'
    return 'normal'
  }

  const getStockColor = () => {
    const status = getStockStatus()
    switch (status) {
      case 'out': return 'bg-red-100 text-red-800 border-red-200'
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStockIcon = () => {
    const status = getStockStatus()
    switch (status) {
      case 'out': return <AlertTriangle className="h-4 w-4" />
      case 'low': return <AlertTriangle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  return (
    <Card 
      className={`transition-all hover:shadow-md ${
        showSubstitutes ? 'ring-2 ring-sky-200 bg-sky-50' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 cursor-pointer" onClick={onClick}>
            <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
              {drug.brandName || drug.genericName}
            </CardTitle>
            {drug.brandName && (
              <p className="text-sm text-gray-600 mt-1">
                Generic: {drug.genericName}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${getStockColor()} flex items-center gap-1`}
              >
                {getStockIcon()}
                {drug.stockLevel}
              </Badge>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                  className="h-8 w-8 p-0 hover:bg-sky-100"
                >
                  <Edit className="h-4 w-4 text-sky-600" />
                </Button>
              )}
            </div>
            {drug.isControlled && (
              <Badge variant="destructive" className="text-xs">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Controlled
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 cursor-pointer" onClick={onClick}>
        <div className="space-y-3">
          {/* Drug Details */}
          <div className="flex items-center gap-2 text-sm">
            <Pill className="h-4 w-4 text-sky-600" />
            <span className="font-medium text-gray-700">
              {drug.activeMolecule} {drug.dosage}
            </span>
            <Badge variant="secondary" className="text-xs">
              {drug.dosageForm}
            </Badge>
          </div>

          {/* Manufacturer & Category */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Manufacturer:</span>
              <p className="font-medium text-gray-900">{drug.manufacturer}</p>
            </div>
            <div>
              <span className="text-gray-500">Category:</span>
              <p className="font-medium text-gray-900">{drug.category}</p>
            </div>
          </div>

          {/* Stock Information */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <div className="text-sm">
              <span className="text-gray-500">Min: </span>
              <span className="font-medium">{drug.minStockLevel}</span>
              <span className="text-gray-400 mx-2">•</span>
              <span className="text-gray-500">Max: </span>
              <span className="font-medium">{drug.maxStockLevel}</span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                ${drug.unitPrice.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">per unit</p>
            </div>
          </div>

          {/* Prescription Required */}
          {drug.requiresPrescription && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
              <ShieldCheck className="h-3 w-3" />
              Prescription Required
            </div>
          )}

          {/* Stock Status Messages */}
          {getStockStatus() === 'out' && (
            <div className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
              Out of Stock - Find Substitutes
            </div>
          )}
          {getStockStatus() === 'low' && (
            <div className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
              Low Stock - Reorder Soon
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}