import { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Search, 
  ScanLine, 
  Filter, 
  X,
  Pill,
  Building,
  Tag,
  AlertTriangle
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover'
import { Checkbox } from './ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface SearchFilters {
  category: string
  stockStatus: string
  requiresPrescription: boolean | null
  isControlled: boolean | null
  manufacturer: string
}

interface SearchBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onBarcodeSearch: () => void
  categories: string[]
  manufacturers: string[]
  activeFiltersCount: number
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  onBarcodeSearch,
  categories,
  manufacturers,
  activeFiltersCount
}: SearchBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const clearFilters = () => {
    onFiltersChange({
      category: '',
      stockStatus: '',
      requiresPrescription: null,
      isControlled: null,
      manufacturer: ''
    })
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by drug name, active molecule, barcode, or manufacturer..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 h-12 text-base"
          />
        </div>
        
        <Button
          variant="outline"
          size="lg"
          onClick={onBarcodeSearch}
          className="flex items-center gap-2 px-4"
        >
          <ScanLine className="h-4 w-4" />
          Scan
        </Button>

        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="flex items-center gap-2 px-4 relative"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Search Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Category
                </label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Stock Status
                </label>
                <Select
                  value={filters.stockStatus}
                  onValueChange={(value) => handleFilterChange('stockStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All stock levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All stock levels</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Manufacturer Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Manufacturer
                </label>
                <Select
                  value={filters.manufacturer}
                  onValueChange={(value) => handleFilterChange('manufacturer', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All manufacturers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All manufacturers</SelectItem>
                    {manufacturers.map((manufacturer) => (
                      <SelectItem key={manufacturer} value={manufacturer}>
                        {manufacturer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prescription & Controlled Checkboxes */}
              <div className="space-y-3 pt-2 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="prescription"
                    checked={filters.requiresPrescription === true}
                    onCheckedChange={(checked) => 
                      handleFilterChange('requiresPrescription', checked ? true : null)
                    }
                  />
                  <label htmlFor="prescription" className="text-sm text-gray-700">
                    Prescription required only
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="controlled"
                    checked={filters.isControlled === true}
                    onCheckedChange={(checked) => 
                      handleFilterChange('isControlled', checked ? true : null)
                    }
                  />
                  <label htmlFor="controlled" className="text-sm text-gray-700 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    Controlled substances only
                  </label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {filters.category}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('category', '')}
              />
            </Badge>
          )}
          {filters.stockStatus && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Stock: {filters.stockStatus.replace('-', ' ')}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('stockStatus', '')}
              />
            </Badge>
          )}
          {filters.manufacturer && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Manufacturer: {filters.manufacturer}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('manufacturer', '')}
              />
            </Badge>
          )}
          {filters.requiresPrescription && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Prescription Required
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('requiresPrescription', null)}
              />
            </Badge>
          )}
          {filters.isControlled && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Controlled Substances
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('isControlled', null)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}