"use client"

import React, { createContext, useContext, useMemo, useState } from "react"

export type ExploreFilters = {
  minPrice?: number
  maxPrice?: number
  type?: string // single | project | bundle
  location?: string
  minRoi?: number
  maxRoi?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  status?: string
  available?: boolean
  featured?: boolean
}

type ExploreFilterContextType = {
  filters: ExploreFilters
  setFilters: (next: Partial<ExploreFilters>) => void
  buildQuery: () => Record<string, any>
  clearFilters: () => void
}

const ExploreFilterContext = createContext<ExploreFilterContextType | undefined>(undefined)

export function ExploreFilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFiltersState] = useState<ExploreFilters>({})

  const setFilters = (next: Partial<ExploreFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...next }))
  }

  const clearFilters = () => {
    setFiltersState({})
  }

  const buildQuery = () => {
    const q: Record<string, any> = {}
    if (filters.minPrice != null) q.minPrice = filters.minPrice
    if (filters.maxPrice != null) q.maxPrice = filters.maxPrice
    if (filters.type) q.type = filters.type
    if (filters.location) q.location = filters.location
    if (filters.minRoi != null) q.minRoi = filters.minRoi
    if (filters.maxRoi != null) q.maxRoi = filters.maxRoi
    if (filters.search) q.search = filters.search
    if (filters.sortBy) q.sortBy = filters.sortBy
    if (filters.sortOrder) q.sortOrder = filters.sortOrder
    if (filters.status) q.status = filters.status
    if (filters.available != null) q.available = filters.available
    if (filters.featured != null) q.featured = filters.featured
    return q
  }

  const value = useMemo(
    () => ({ filters, setFilters, buildQuery, clearFilters }),
    [filters]
  )

  return (
    <ExploreFilterContext.Provider value={value}>{children}</ExploreFilterContext.Provider>
  )
}

export function useExploreFilter() {
  const ctx = useContext(ExploreFilterContext)
  if (!ctx) throw new Error("useExploreFilter must be used within ExploreFilterProvider")
  return ctx
}
