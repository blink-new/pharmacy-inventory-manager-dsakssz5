import { useState, useEffect } from 'react'
import { Drug } from '../types/pharmacy'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'
import { 
  Pill, 
  Package, 
  DollarSign, 
  Calendar,
  Scan,
  Plus,
  X,
  Save,
  RotateCcw
} from 'lucide-react'

interface EditDrugModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdateDrug: (updatedDrug: Drug) => void
  drug: Drug | null
  categories: string[]
  manufacturers: string[]
}

export function EditDrugModal({ 
  isOpen, 
  onClose, 
  onUpdateDrug, 
  drug,
  categories,
  manufacturers 
}: EditDrugModalProps) {
  const [formData, setFormData] = useState<Partial<Drug>>({})
  const [customCategory, setCustomCategory] = useState('')
  const [customManufacturer, setCustomManufacturer] = useState('')
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [showCustomManufacturer, setShowCustomManufacturer] = useState(false)

  // Initialize form data when drug changes
  useEffect(() => {
    if (drug) {
      setFormData({ ...drug })
      setCustomCategory('')
      setCustomManufacturer('')
      setShowCustomCategory(false)
      setShowCustomManufacturer(false)
    }
  }, [drug])

  const handleInputChange = (field: keyof Drug, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.activeMolecule || !formData.dosage) {
      alert('Please fill in all required fields (Name, Active Molecule, Dosage)')
      return
    }

    const finalCategory = showCustomCategory && customCategory 
      ? customCategory 
      : formData.category || ''
    
    const finalManufacturer = showCustomManufacturer && customManufacturer 
      ? customManufacturer 
      : formData.manufacturer || ''

    const updatedDrug: Drug = {
      ...formData,
      category: finalCategory,
      manufacturer: finalManufacturer,
      updatedAt: new Date().toISOString()
    } as Drug

    onUpdateDrug(updatedDrug)
    onClose()
  }

  const handleReset = () => {
    if (drug) {
      setFormData({ ...drug })
      setCustomCategory('')
      setCustomManufacturer('')
      setShowCustomCategory(false)
      setShowCustomManufacturer(false)
    }
  }

  const generateBarcode = () => {
    const barcode = `${Date.now()}${Math.floor(Math.random() * 1000)}`
    handleInputChange('barcode', barcode)
  }

  if (!drug) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Pill className="h-6 w-6 text-sky-600" />
            Edit Drug: {drug.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="h-5 w-5 text-sky-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Drug Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter drug name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="genericName">Generic Name</Label>
                  <Input
                    id="genericName"
                    value={formData.genericName || ''}
                    onChange={(e) => handleInputChange('genericName', e.target.value)}
                    placeholder="Enter generic name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    value={formData.brandName || ''}
                    onChange={(e) => handleInputChange('brandName', e.target.value)}
                    placeholder="Enter brand name"
                  />
                </div>
                <div>
                  <Label htmlFor="activeMolecule">Active Molecule *</Label>
                  <Input
                    id="activeMolecule"
                    value={formData.activeMolecule || ''}
                    onChange={(e) => handleInputChange('activeMolecule', e.target.value)}
                    placeholder="e.g., Paracetamol"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage || ''}
                    onChange={(e) => handleInputChange('dosage', e.target.value)}
                    placeholder="e.g., 500mg"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dosageForm">Dosage Form</Label>
                  <Select 
                    value={formData.dosageForm || ''} 
                    onValueChange={(value) => handleInputChange('dosageForm', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                      <SelectItem value="Capsule">Capsule</SelectItem>
                      <SelectItem value="Syrup">Syrup</SelectItem>
                      <SelectItem value="Injection">Injection</SelectItem>
                      <SelectItem value="Cream">Cream</SelectItem>
                      <SelectItem value="Drops">Drops</SelectItem>
                      <SelectItem value="Inhaler">Inhaler</SelectItem>
                      <SelectItem value="Suppository">Suppository</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="strength">Strength</Label>
                  <Input
                    id="strength"
                    value={formData.strength || ''}
                    onChange={(e) => handleInputChange('strength', e.target.value)}
                    placeholder="e.g., Regular, Extra Strength"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter drug description and usage instructions"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Classification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={showCustomCategory ? 'custom' : formData.category || ''} 
                      onValueChange={(value) => {
                        if (value === 'custom') {
                          setShowCustomCategory(true)
                        } else {
                          setShowCustomCategory(false)
                          handleInputChange('category', value)
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        <Separator />
                        <SelectItem value="custom">
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Category
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {showCustomCategory && (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter new category"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCustomCategory(false)
                          setCustomCategory('')
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Manufacturer</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={showCustomManufacturer ? 'custom' : formData.manufacturer || ''} 
                      onValueChange={(value) => {
                        if (value === 'custom') {
                          setShowCustomManufacturer(true)
                        } else {
                          setShowCustomManufacturer(false)
                          handleInputChange('manufacturer', value)
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select manufacturer" />
                      </SelectTrigger>
                      <SelectContent>
                        {manufacturers.map(mfg => (
                          <SelectItem key={mfg} value={mfg}>{mfg}</SelectItem>
                        ))}
                        <Separator />
                        <SelectItem value="custom">
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Manufacturer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {showCustomManufacturer && (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={customManufacturer}
                        onChange={(e) => setCustomManufacturer(e.target.value)}
                        placeholder="Enter new manufacturer"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCustomManufacturer(false)
                          setCustomManufacturer('')
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requiresPrescription"
                        checked={formData.requiresPrescription || false}
                        onCheckedChange={(checked) => handleInputChange('requiresPrescription', checked)}
                      />
                      <Label htmlFor="requiresPrescription">Requires Prescription</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isControlled"
                        checked={formData.isControlled || false}
                        onCheckedChange={(checked) => handleInputChange('isControlled', checked)}
                      />
                      <Label htmlFor="isControlled">Controlled Substance</Label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {formData.requiresPrescription && (
                      <Badge variant="secondary">Prescription Required</Badge>
                    )}
                    {formData.isControlled && (
                      <Badge variant="destructive">Controlled Substance</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Inventory & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="stockLevel">Current Stock</Label>
                  <Input
                    id="stockLevel"
                    type="number"
                    min="0"
                    value={formData.stockLevel || 0}
                    onChange={(e) => handleInputChange('stockLevel', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="minStockLevel">Minimum Stock</Label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    min="0"
                    value={formData.minStockLevel || 0}
                    onChange={(e) => handleInputChange('minStockLevel', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="maxStockLevel">Maximum Stock</Label>
                  <Input
                    id="maxStockLevel"
                    type="number"
                    min="0"
                    value={formData.maxStockLevel || 0}
                    onChange={(e) => handleInputChange('maxStockLevel', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unitPrice" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Unit Price
                  </Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice || 0}
                    onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Expiry Date
                  </Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate || ''}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batchNumber">Batch Number</Label>
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber || ''}
                    onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                    placeholder="Enter batch number"
                  />
                </div>
                <div>
                  <Label htmlFor="barcode" className="flex items-center gap-2">
                    <Scan className="h-4 w-4" />
                    Barcode
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode"
                      value={formData.barcode || ''}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                      placeholder="Enter or generate barcode"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateBarcode}
                    >
                      <Scan className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Changes
            </Button>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Update Drug
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}