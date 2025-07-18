import { Drug, SubstitutionSuggestion, SubstitutionRule } from '../types/pharmacy'

export class SubstitutionEngine {
  private drugs: Drug[] = []
  private substitutionRules: SubstitutionRule[] = []

  constructor(drugs: Drug[], rules: SubstitutionRule[] = []) {
    this.drugs = drugs
    this.substitutionRules = rules
  }

  /**
   * Find substitute drugs based on active molecule and dosage
   */
  findSubstitutes(targetDrug: Drug, availableOnly: boolean = true): SubstitutionSuggestion[] {
    const suggestions: SubstitutionSuggestion[] = []
    
    // Filter available drugs if requested
    const searchPool = availableOnly 
      ? this.drugs.filter(drug => drug.stockLevel > 0 && drug.id !== targetDrug.id)
      : this.drugs.filter(drug => drug.id !== targetDrug.id)

    // 1. Exact matches (same active molecule, same dosage, same form)
    const exactMatches = searchPool.filter(drug => 
      drug.activeMolecule.toLowerCase() === targetDrug.activeMolecule.toLowerCase() &&
      drug.dosage === targetDrug.dosage &&
      drug.dosageForm.toLowerCase() === targetDrug.dosageForm.toLowerCase()
    )

    exactMatches.forEach(drug => {
      suggestions.push({
        drug,
        matchType: 'exact',
        confidence: 95,
        reason: `Same active molecule (${drug.activeMolecule}), dosage (${drug.dosage}), and form (${drug.dosageForm})`
      })
    })

    // 2. Equivalent matches (same active molecule, different dosage or form)
    const equivalentMatches = searchPool.filter(drug => 
      drug.activeMolecule.toLowerCase() === targetDrug.activeMolecule.toLowerCase() &&
      !exactMatches.includes(drug)
    )

    equivalentMatches.forEach(drug => {
      const confidence = this.calculateEquivalentConfidence(targetDrug, drug)
      const dosageAdjustment = this.calculateDosageAdjustment(targetDrug, drug)
      const warnings = this.getSubstitutionWarnings(targetDrug, drug)

      suggestions.push({
        drug,
        matchType: 'equivalent',
        confidence,
        reason: `Same active molecule (${drug.activeMolecule}) with ${drug.dosage} ${drug.dosageForm}`,
        dosageAdjustment,
        warnings
      })
    })

    // 3. Similar matches (different active molecule but same therapeutic class)
    const similarMatches = this.findSimilarByTherapeuticClass(targetDrug, searchPool)
    
    similarMatches.forEach(({ drug, similarity }) => {
      suggestions.push({
        drug,
        matchType: 'similar',
        confidence: similarity,
        reason: `Similar therapeutic class (${drug.category})`,
        warnings: ['Different active molecule - consult pharmacist before substitution']
      })
    })

    // 4. Apply custom substitution rules
    const ruleBasedSuggestions = this.applySubstitutionRules(targetDrug, searchPool)
    suggestions.push(...ruleBasedSuggestions)

    // Sort by confidence and remove duplicates
    return this.deduplicateAndSort(suggestions)
  }

  /**
   * Calculate confidence for equivalent matches
   */
  private calculateEquivalentConfidence(target: Drug, candidate: Drug): number {
    let confidence = 80 // Base confidence for same active molecule

    // Same dosage form bonus
    if (target.dosageForm.toLowerCase() === candidate.dosageForm.toLowerCase()) {
      confidence += 10
    }

    // Dosage similarity
    const targetStrength = this.parseStrength(target.dosage)
    const candidateStrength = this.parseStrength(candidate.dosage)
    
    if (targetStrength && candidateStrength) {
      const ratio = Math.min(targetStrength, candidateStrength) / Math.max(targetStrength, candidateStrength)
      confidence += Math.floor(ratio * 10) // Up to 10 points for dosage similarity
    }

    // Brand vs generic consideration
    if (target.brandName && candidate.brandName) {
      confidence += 5 // Both branded
    } else if (!target.brandName && !candidate.brandName) {
      confidence += 5 // Both generic
    }

    return Math.min(confidence, 90) // Cap at 90 for equivalent matches
  }

  /**
   * Calculate dosage adjustment instructions
   */
  private calculateDosageAdjustment(target: Drug, candidate: Drug): string | undefined {
    const targetStrength = this.parseStrength(target.dosage)
    const candidateStrength = this.parseStrength(candidate.dosage)

    if (!targetStrength || !candidateStrength) return undefined

    const ratio = targetStrength / candidateStrength

    if (ratio === 1) return undefined

    if (ratio > 1) {
      return `Take ${ratio.toFixed(1)}x the usual dose (${candidate.dosage} → equivalent to ${target.dosage})`
    } else {
      return `Take ${(1/ratio).toFixed(1)}x less (${candidate.dosage} → equivalent to ${target.dosage})`
    }
  }

  /**
   * Get substitution warnings
   */
  private getSubstitutionWarnings(target: Drug, candidate: Drug): string[] {
    const warnings: string[] = []

    // Different dosage form warning
    if (target.dosageForm.toLowerCase() !== candidate.dosageForm.toLowerCase()) {
      warnings.push(`Different dosage form: ${target.dosageForm} → ${candidate.dosageForm}`)
    }

    // Controlled substance warning
    if (target.isControlled || candidate.isControlled) {
      warnings.push('Controlled substance - verify prescription requirements')
    }

    // Different manufacturer warning for critical drugs
    if (target.manufacturer !== candidate.manufacturer && target.category.toLowerCase().includes('cardiac')) {
      warnings.push('Different manufacturer - monitor patient response')
    }

    return warnings
  }

  /**
   * Find similar drugs by therapeutic class
   */
  private findSimilarByTherapeuticClass(target: Drug, searchPool: Drug[]): Array<{drug: Drug, similarity: number}> {
    return searchPool
      .filter(drug => 
        drug.category.toLowerCase() === target.category.toLowerCase() &&
        drug.activeMolecule.toLowerCase() !== target.activeMolecule.toLowerCase()
      )
      .map(drug => ({
        drug,
        similarity: this.calculateTherapeuticSimilarity(target, drug)
      }))
      .filter(item => item.similarity >= 30) // Minimum similarity threshold
  }

  /**
   * Calculate therapeutic similarity
   */
  private calculateTherapeuticSimilarity(target: Drug, candidate: Drug): number {
    let similarity = 40 // Base similarity for same category

    // Same dosage form bonus
    if (target.dosageForm.toLowerCase() === candidate.dosageForm.toLowerCase()) {
      similarity += 20
    }

    // Similar naming patterns (generic names)
    if (this.haveSimilarNames(target.genericName, candidate.genericName)) {
      similarity += 15
    }

    return Math.min(similarity, 75) // Cap at 75 for similar matches
  }

  /**
   * Apply custom substitution rules
   */
  private applySubstitutionRules(target: Drug, searchPool: Drug[]): SubstitutionSuggestion[] {
    const suggestions: SubstitutionSuggestion[] = []

    const applicableRules = this.substitutionRules.filter(rule =>
      rule.isActive &&
      rule.activeMolecule.toLowerCase() === target.activeMolecule.toLowerCase() &&
      rule.dosage === target.dosage &&
      rule.dosageForm.toLowerCase() === target.dosageForm.toLowerCase()
    )

    applicableRules.forEach(rule => {
      rule.equivalentDrugs.forEach(drugId => {
        const drug = searchPool.find(d => d.id === drugId)
        if (drug) {
          suggestions.push({
            drug,
            matchType: 'equivalent',
            confidence: 85,
            reason: `Custom substitution rule: ${rule.notes || 'Pharmacy-approved equivalent'}`,
            dosageAdjustment: rule.substitutionRatio !== 1 
              ? `Adjust dose by factor of ${rule.substitutionRatio}` 
              : undefined
          })
        }
      })
    })

    return suggestions
  }

  /**
   * Parse strength from dosage string (e.g., "500mg" → 500)
   */
  private parseStrength(dosage: string): number | null {
    const match = dosage.match(/(\d+(?:\.\d+)?)\s*(mg|g|ml|mcg|µg)/i)
    if (!match) return null

    let value = parseFloat(match[1])
    const unit = match[2].toLowerCase()

    // Convert to mg for standardization
    switch (unit) {
      case 'g': value *= 1000; break
      case 'mcg':
      case 'µg': value /= 1000; break
      case 'ml': break // Assume 1ml = 1mg for liquids (approximation)
      default: break // mg stays as is
    }

    return value
  }

  /**
   * Check if two names are similar
   */
  private haveSimilarNames(name1: string, name2: string): boolean {
    const clean1 = name1.toLowerCase().replace(/[^a-z]/g, '')
    const clean2 = name2.toLowerCase().replace(/[^a-z]/g, '')
    
    // Simple similarity check - could be enhanced with Levenshtein distance
    return clean1.includes(clean2.substring(0, 4)) || clean2.includes(clean1.substring(0, 4))
  }

  /**
   * Remove duplicates and sort by confidence
   */
  private deduplicateAndSort(suggestions: SubstitutionSuggestion[]): SubstitutionSuggestion[] {
    const seen = new Set<string>()
    const unique = suggestions.filter(suggestion => {
      if (seen.has(suggestion.drug.id)) return false
      seen.add(suggestion.drug.id)
      return true
    })

    return unique.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Update drugs and rules
   */
  updateData(drugs: Drug[], rules: SubstitutionRule[] = []) {
    this.drugs = drugs
    this.substitutionRules = rules
  }
}