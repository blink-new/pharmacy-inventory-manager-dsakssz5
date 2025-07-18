import { useState } from 'react'
import { Drug } from '../types/pharmacy'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Badge } from './ui/badge'
import { X, Plus, Scan } from 'lucide-react'

interface AddDrugModalProps {
  isOpen: boolean
  onClose: () => void
  onAddDrug: (drug: Drug) => void
  categories: string[]
  manufacturers: string[]
}

export function AddDrugModal({ 
  isOpen, 
  onClose, 
  onAddDrug, 
  categories, 
  manufacturers 
}: AddDrugModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    brandName: '',
    activeMolecule: '',
    dosage: '',
    form: 'tablet',
    category: '',
    manufacturer: '',
    barcode: '',
    stockLevel: '',
    minStockLevel: '',
    maxStockLevel: '',
    unitPrice: '',
    batchNumber: '',
    expiryDate: '',
    requiresPrescription: false,
    isControlled: false,
    description: '',
    sideEffects: '',
    contraindications: '',
    therapeuticClass: ''
  })

  const [customCategory, setCustomCategory] = useState('')
  const [customManufacturer, setCustomManufacturer] = useState('')
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [showCustomManufacturer, setShowCustomManufacturer] = useState(false)

  const drugForms = [
    'tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 
    'drops', 'inhaler', 'patch', 'suppository', 'powder', 'gel'
  ]

  const therapeuticClasses = [
    'Analgesic', 'Antibiotic', 'Antacid', 'Antihistamine', 'Anti-inflammatory',
    'Antihypertensive', 'Antidiabetic', 'Cardiovascular', 'Respiratory',
    'Gastrointestinal', 'Neurological', 'Dermatological', 'Hormonal'
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.activeMolecule || !formData.dosage) {
      alert('Please fill in all required fields (Name, Active Molecule, Dosage)')
      return
    }

    const finalCategory = showCustomCategory && customCategory 
      ? customCategory 
      : formData.category

    const finalManufacturer = showCustomManufacturer && customManufacturer 
      ? customManufacturer 
      : formData.manufacturer

    if (!finalCategory || !finalManufacturer) {
      alert('Please select or enter a category and manufacturer')
      return
    }

    // Create new drug object
    const newDrug: Drug = {
      id: `drug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name,
      genericName: formData.genericName || formData.name,
      brandName: formData.brandName || formData.name,
      activeMolecule: formData.activeMolecule,
      dosage: formData.dosage,
      form: formData.form as Drug['form'],
      category: finalCategory,
      manufacturer: finalManufacturer,
      barcode: formData.barcode || undefined,
      stockLevel: parseInt(formData.stockLevel) || 0,
      minStockLevel: parseInt(formData.minStockLevel) || 10,
      maxStockLevel: parseInt(formData.maxStockLevel) || 100,
      unitPrice: parseFloat(formData.unitPrice) || 0,
      batchNumber: formData.batchNumber || `BATCH_${Date.now()}`,
      expiryDate: formData.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      requiresPrescription: formData.requiresPrescription,
      isControlled: formData.isControlled,
      description: formData.description || undefined,
      sideEffects: formData.sideEffects || undefined,
      contraindications: formData.contraindications || undefined,
      therapeuticClass: formData.therapeuticClass || undefined
    }

    onAddDrug(newDrug)
    handleReset()
    onClose()
  }

  const handleReset = () => {
    setFormData({
      name: '',
      genericName: '',
      brandName: '',
      activeMolecule: '',
      dosage: '',
      form: 'tablet',
      category: '',
      manufacturer: '',
      barcode: '',
      stockLevel: '',
      minStockLevel: '',
      maxStockLevel: '',
      unitPrice: '',
      batchNumber: '',
      expiryDate: '',
      requiresPrescription: false,
      isControlled: false,
      description: '',
      sideEffects: '',
      contraindications: '',
      therapeuticClass: ''
    })
    setCustomCategory('')
    setCustomManufacturer('')
    setShowCustomCategory(false)
    setShowCustomManufacturer(false)
  }

  const handleBarcodeGenerate = () => {
    const barcode = `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    handleInputChange('barcode', barcode)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-sky-600" />
            Add New Drug to Inventory
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Drug Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Paracetamol 500mg"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="genericName">Generic Name</Label>
                <Input
                  id="genericName"
                  value={formData.genericName}
                  onChange={(e) => handleInputChange('genericName', e.target.value)}
                  placeholder="e.g., Acetaminophen"
                />
              </div>
              
              <div>
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => handleInputChange('brandName', e.target.value)}
                  placeholder="e.g., Tylenol"
                />
              </div>
              
              <div>
                <Label htmlFor="activeMolecule">Active Molecule *</Label>
                <Input
                  id="activeMolecule"
                  value={formData.activeMolecule}
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
                  value={formData.dosage}
                  onChange={(e) => handleInputChange('dosage', e.target.value)}
                  placeholder="e.g., 500mg"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="form">Form</Label>
                <Select value={formData.form} onValueChange={(value) => handleInputChange('form', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {drugForms.map(form => (
                      <SelectItem key={form} value={form}>
                        {form.charAt(0).toUpperCase() + form.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="therapeuticClass">Therapeutic Class</Label>
                <Select value={formData.therapeuticClass} onValueChange={(value) => handleInputChange('therapeuticClass', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {therapeuticClasses.map(cls => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Category and Manufacturer */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Classification
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <div className="space-y-2">
                  {!showCustomCategory ? (
                    <div className="flex gap-2">
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCustomCategory(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
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
                        onClick={() => setShowCustomCategory(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label>Manufacturer *</Label>
                <div className="space-y-2">
                  {!showCustomManufacturer ? (
                    <div className="flex gap-2">
                      <Select value={formData.manufacturer} onValueChange={(value) => handleInputChange('manufacturer', value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select manufacturer" />
                        </SelectTrigger>
                        <SelectContent>
                          {manufacturers.map(manufacturer => (
                            <SelectItem key={manufacturer} value={manufacturer}>
                              {manufacturer}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCustomManufacturer(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
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
                        onClick={() => setShowCustomManufacturer(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Inventory & Pricing
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="stockLevel">Current Stock</Label>
                <Input
                  id="stockLevel"
                  type="number"
                  value={formData.stockLevel}
                  onChange={(e) => handleInputChange('stockLevel', e.target.value)}
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="minStockLevel">Min Stock Level</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={(e) => handleInputChange('minStockLevel', e.target.value)}
                  placeholder="10"
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="maxStockLevel">Max Stock Level</Label>
                <Input
                  id="maxStockLevel"
                  type="number"
                  value={formData.maxStockLevel}
                  onChange={(e) => handleInputChange('maxStockLevel', e.target.value)}
                  placeholder="100"
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="unitPrice">Unit Price ($)</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                  placeholder="0.00"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Product Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    placeholder="Scan or enter barcode"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleBarcodeGenerate}
                    title="Generate barcode"
                  >
                    <Scan className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                  placeholder="Auto-generated if empty"
                />
              </div>
              
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the medication"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="sideEffects">Side Effects</Label>
                <Textarea
                  id="sideEffects"
                  value={formData.sideEffects}
                  onChange={(e) => handleInputChange('sideEffects', e.target.value)}
                  placeholder="Common side effects (optional)"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="contraindications">Contraindications</Label>
                <Textarea
                  id="contraindications"
                  value={formData.contraindications}
                  onChange={(e) => handleInputChange('contraindications', e.target.value)}
                  placeholder="Contraindications and warnings (optional)"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Regulatory */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Regulatory Information
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="requiresPrescription"
                  checked={formData.requiresPrescription}
                  onCheckedChange={(checked) => handleInputChange('requiresPrescription', checked)}
                />
                <Label htmlFor="requiresPrescription" className="flex items-center gap-2">
                  Requires Prescription
                  {formData.requiresPrescription && (
                    <Badge variant="secondary" className="text-xs">
                      Rx
                    </Badge>
                  )}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isControlled"
                  checked={formData.isControlled}
                  onCheckedChange={(checked) => handleInputChange('isControlled', checked)}
                />
                <Label htmlFor="isControlled" className="flex items-center gap-2">
                  Controlled Substance
                  {formData.isControlled && (
                    <Badge variant="destructive" className="text-xs">
                      Controlled
                    </Badge>
                  )}
                </Label>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="ghost" onClick={handleReset}>
            Reset Form
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Add Drug to Inventory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}