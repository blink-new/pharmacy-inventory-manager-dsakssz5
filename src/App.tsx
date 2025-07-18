import { useState, useEffect, useMemo } from 'react'
import { Drug } from './types/pharmacy'
import { sampleDrugs } from './data/sampleDrugs'
import { DrugCard } from './components/DrugCard'
import { SubstitutionPanel } from './components/SubstitutionPanel'
import { SearchBar } from './components/SearchBar'
import { AddDrugModal } from './components/AddDrugModal'
import { EditDrugModal } from './components/EditDrugModal'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { 
  Pill, 
  Search, 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  Package,
  Zap,
  Activity
} from 'lucide-react'
import { blink } from './blink/client'

interface SearchFilters {
  category: string
  stockStatus: string
  requiresPrescription: boolean | null
  isControlled: boolean | null
  manufacturer: string
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [drugs, setDrugs] = useState<Drug[]>(sampleDrugs)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null)
  const [showSubstitutionPanel, setShowSubstitutionPanel] = useState(false)
  const [showAddDrugModal, setShowAddDrugModal] = useState(false)
  const [showEditDrugModal, setShowEditDrugModal] = useState(false)
  const [drugToEdit, setDrugToEdit] = useState<Drug | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    stockStatus: '',
    requiresPrescription: null,
    isControlled: null,
    manufacturer: ''
  })

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  // Filter and search logic
  const filteredDrugs = useMemo(() => {
    return drugs.filter(drug => {
      // Text search
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = !searchTerm || 
        drug.name.toLowerCase().includes(searchLower) ||
        drug.genericName.toLowerCase().includes(searchLower) ||
        drug.brandName.toLowerCase().includes(searchLower) ||
        drug.activeMolecule.toLowerCase().includes(searchLower) ||
        drug.manufacturer.toLowerCase().includes(searchLower) ||
        drug.barcode?.includes(searchTerm)

      // Category filter
      const matchesCategory = !filters.category || drug.category === filters.category

      // Stock status filter
      let matchesStock = true
      if (filters.stockStatus === 'in-stock') {
        matchesStock = drug.stockLevel > drug.minStockLevel
      } else if (filters.stockStatus === 'low-stock') {
        matchesStock = drug.stockLevel > 0 && drug.stockLevel <= drug.minStockLevel
      } else if (filters.stockStatus === 'out-of-stock') {
        matchesStock = drug.stockLevel === 0
      }

      // Prescription filter
      const matchesPrescription = filters.requiresPrescription === null || 
        drug.requiresPrescription === filters.requiresPrescription

      // Controlled filter
      const matchesControlled = filters.isControlled === null || 
        drug.isControlled === filters.isControlled

      // Manufacturer filter
      const matchesManufacturer = !filters.manufacturer || drug.manufacturer === filters.manufacturer

      return matchesSearch && matchesCategory && matchesStock && 
             matchesPrescription && matchesControlled && matchesManufacturer
    })
  }, [drugs, searchTerm, filters])

  // Get unique values for filters
  const categories = useMemo(() => 
    [...new Set(drugs.map(drug => drug.category))].sort(), [drugs]
  )
  
  const manufacturers = useMemo(() => 
    [...new Set(drugs.map(drug => drug.manufacturer))].sort(), [drugs]
  )

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.category) count++
    if (filters.stockStatus) count++
    if (filters.requiresPrescription !== null) count++
    if (filters.isControlled !== null) count++
    if (filters.manufacturer) count++
    return count
  }, [filters])

  // Calculate dashboard stats
  const stats = useMemo(() => {
    const totalDrugs = drugs.length
    const inStock = drugs.filter(d => d.stockLevel > 0).length
    const lowStock = drugs.filter(d => d.stockLevel > 0 && d.stockLevel <= d.minStockLevel).length
    const outOfStock = drugs.filter(d => d.stockLevel === 0).length
    const totalValue = drugs.reduce((sum, drug) => sum + (drug.stockLevel * drug.unitPrice), 0)

    return { totalDrugs, inStock, lowStock, outOfStock, totalValue }
  }, [drugs])

  const handleDrugClick = (drug: Drug) => {
    setSelectedDrug(drug)
    setShowSubstitutionPanel(true)
  }

  const handleBarcodeSearch = () => {
    // Simulate barcode scanning
    alert('Barcode scanner would open here. For demo, searching for "Panadol"...')
    setSearchTerm('Panadol')
  }

  const handleSelectSubstitute = (drug: Drug) => {
    setShowSubstitutionPanel(false)
    setSelectedDrug(null)
    // Open edit modal for the selected substitute
    setDrugToEdit(drug)
    setShowEditDrugModal(true)
  }

  const handleAddDrug = (newDrug: Drug) => {
    setDrugs(prev => [...prev, newDrug])
    alert(`Successfully added ${newDrug.name} to inventory!`)
  }

  const handleUpdateDrug = (updatedDrug: Drug) => {
    setDrugs(prev => prev.map(drug => 
      drug.id === updatedDrug.id ? updatedDrug : drug
    ))
    alert(`Successfully updated ${updatedDrug.name}!`)
  }

  const handleEditDrug = (drug: Drug) => {
    setDrugToEdit(drug)
    setShowEditDrugModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Pharmacy System...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Pill className="h-16 w-16 text-sky-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pharmacy Inventory System
          </h1>
          <p className="text-gray-600 mb-8">
            Please sign in to access the pharmacy inventory management system.
          </p>
          <Button onClick={() => blink.auth.login()} size="lg" className="w-full">
            Sign In to Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Pill className="h-8 w-8 text-sky-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Pharmacy Inventory
                </h1>
                <p className="text-sm text-gray-600">Smart Substitution System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                <Activity className="h-3 w-3 mr-1" />
                Online
              </Badge>
              <Button
                variant="ghost"
                onClick={() => blink.auth.logout()}
                className="text-gray-600"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Drugs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalDrugs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Out of Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${stats.totalValue.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Search className="h-5 w-5 text-sky-600" />
                Drug Search & Substitution
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Search for medications and find intelligent substitutes
              </p>
            </div>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setShowAddDrugModal(true)}
            >
              <Plus className="h-4 w-4" />
              Add New Drug
            </Button>
          </div>

          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFiltersChange={setFilters}
            onBarcodeSearch={handleBarcodeSearch}
            categories={categories}
            manufacturers={manufacturers}
            activeFiltersCount={activeFiltersCount}
          />
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Search Results ({filteredDrugs.length})
              </h3>
              {searchTerm && (
                <p className="text-sm text-gray-600 mt-1">
                  Showing results for "{searchTerm}"
                </p>
              )}
            </div>
            {filteredDrugs.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="h-4 w-4 text-sky-600" />
                Click any drug to find substitutes
              </div>
            )}
          </div>

          {/* Drug Grid */}
          {filteredDrugs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No drugs found</h4>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setFilters({
                    category: '',
                    stockStatus: '',
                    requiresPrescription: null,
                    isControlled: null,
                    manufacturer: ''
                  })
                }}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrugs.map((drug) => (
                <DrugCard
                  key={drug.id}
                  drug={drug}
                  onClick={() => handleDrugClick(drug)}
                  onEdit={() => handleEditDrug(drug)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        {stats.lowStock > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-800">Low Stock Alert</h4>
                <p className="text-yellow-700 text-sm">
                  {stats.lowStock} item{stats.lowStock > 1 ? 's' : ''} running low on stock. 
                  Consider reordering soon.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Substitution Panel */}
      {showSubstitutionPanel && (
        <SubstitutionPanel
          targetDrug={selectedDrug}
          allDrugs={drugs}
          onClose={() => {
            setShowSubstitutionPanel(false)
            setSelectedDrug(null)
          }}
          onSelectSubstitute={handleSelectSubstitute}
        />
      )}

      {/* Add Drug Modal */}
      <AddDrugModal
        isOpen={showAddDrugModal}
        onClose={() => setShowAddDrugModal(false)}
        onAddDrug={handleAddDrug}
        categories={categories}
        manufacturers={manufacturers}
      />

      {/* Edit Drug Modal */}
      <EditDrugModal
        isOpen={showEditDrugModal}
        onClose={() => {
          setShowEditDrugModal(false)
          setDrugToEdit(null)
        }}
        onUpdateDrug={handleUpdateDrug}
        drug={drugToEdit}
        categories={categories}
        manufacturers={manufacturers}
      />
    </div>
  )
}

export default App