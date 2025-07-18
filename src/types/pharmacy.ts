export interface Drug {
  id: string
  name: string
  genericName: string
  brandName: string
  activeMolecule: string
  dosage: string
  dosageForm: string // tablet, capsule, syrup, injection, etc.
  strength: string
  manufacturer: string
  barcode?: string
  category: string
  isControlled: boolean
  requiresPrescription: boolean
  expiryDate?: string
  batchNumber?: string
  stockLevel: number
  minStockLevel: number
  maxStockLevel: number
  unitPrice: number
  isCustom: boolean // true if added by pharmacy, false if from pre-loaded database
  createdAt: string
  updatedAt: string
  userId: string
}

export interface SubstitutionRule {
  id: string
  activeMolecule: string
  dosage: string
  dosageForm: string
  equivalentDrugs: string[] // array of drug IDs
  substitutionRatio: number // 1.0 for direct substitution, other values for dose adjustments
  notes?: string
  isActive: boolean
  createdAt: string
  userId: string
}

export interface InventoryTransaction {
  id: string
  drugId: string
  type: 'add' | 'remove' | 'adjust' | 'dispense' | 'expire' | 'recall'
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  batchNumber?: string
  expiryDate?: string
  userId: string
  userRole: string
  timestamp: string
}

export interface SubstitutionSuggestion {
  drug: Drug
  matchType: 'exact' | 'equivalent' | 'similar'
  confidence: number // 0-100
  reason: string
  dosageAdjustment?: string
  warnings?: string[]
}

export type UserRole = 'admin' | 'pharmacist' | 'assistant'

export interface PharmacyUser {
  id: string
  email: string
  name: string
  role: UserRole
  permissions: string[]
  isActive: boolean
  createdAt: string
}