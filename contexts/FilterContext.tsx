"use client";
import React, { createContext, useContext, useState, useMemo } from "react";

export interface Filters {
  investmentRange: [number, number];
  propertyType: string[];
  location: string[];
  expectedROI: string[];
  deliveryDate: string[];
  search: string;
  sortBy: string;
}

interface FilterContextType {
  filters: Filters;
  updateFilter: (key: keyof Filters, value: any) => void;
  applyFilters: (properties: any[]) => any[];
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [filters, setFilters] = useState<Filters>({
    investmentRange: [1000, 50000],
    propertyType: [],
    location: [],
    expectedROI: [],
    deliveryDate: [],
    search: "",
    sortBy: "default",
  });

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = (properties: any[]) => {
    let result = [...properties];

    // Investment range filter
    result = result.filter(
      (p) =>
        p.price >= filters.investmentRange[0] &&
        p.price <= filters.investmentRange[1]
    );

    // Property type filter
    if (filters.propertyType.length > 0) {
      result = result.filter((p) => filters.propertyType.includes(p.type));
    }

    // Location filter
    if (filters.location.length > 0) {
      result = result.filter((p) => filters.location.includes(p.location));
    }

    // Expected ROI filter
    if (filters.expectedROI.length > 0) {
      result = result.filter((p) => {
        if (filters.expectedROI.includes("Low")) return p.roi < 10;
        if (filters.expectedROI.includes("Mid")) return p.roi >= 10 && p.roi < 20;
        if (filters.expectedROI.includes("High")) return p.roi >= 20;
        return true;
      });
    }

    // Delivery date filter
    if (filters.deliveryDate.length > 0) {
      result = result.filter((p) =>
        filters.deliveryDate.includes(p.deliveryStatus)
      );
    }

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }

    // Sorting logic
    switch (filters.sortBy) {
      case "priceLowHigh":
        result.sort((a, b) => a.price - b.price);
        break;
      case "priceHighLow":
        result.sort((a, b) => b.price - a.price);
        break;
      case "roiHighLow":
        result.sort((a, b) => b.roi - a.roi);
        break;
      case "durationShortLong":
        result.sort((a, b) => a.duration - b.duration);
        break;
    }

    return result;
  };

  const value = useMemo(
    () => ({
      filters,
      updateFilter,
      applyFilters,
    }),
    [filters]
  );

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context)
    throw new Error("useFilter must be used within a FilterProvider");
  return context;
};
