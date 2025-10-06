"use client";
import PropertyCard from "./PropertyCard";
import { useFilter } from "@/contexts/FilterContext";
import {allProperties} from "@/app/data/properties"

const PropertyList = () => {
  const { applyFilters } = useFilter();

  const filtered = applyFilters(allProperties);

  return (
    <div className="flex-1 grid grid-cols-1 gap-6">
      {filtered.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
      {filtered.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          No properties match your filters.
        </div>
      )}
    </div>
  );
};

export default PropertyList;
