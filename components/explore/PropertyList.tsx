"use client";
import PropertyCard from "./PropertyCard";
import { useExploreFilter } from "@/contexts/ExploreFilterContext";
import { useProperties } from "@/contexts/PropertiesContext";
import { useEffect, useMemo, useState } from "react";

const PropertyList = () => {
  const { buildQuery } = useExploreFilter();
  const { search } = useProperties();
  const [serverFiltered, setServerFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Build API query from filters (server-side filtering)
  const apiQuery = useMemo(() => buildQuery(), [buildQuery])

  useEffect(() => {
    let cancelled = false
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const res = await search(apiQuery)
        if (!cancelled) setServerFiltered(res)
      } catch (error) {
        console.error("Failed to fetch filtered properties:", error);
        if (!cancelled) setServerFiltered([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    
    fetchFiltered();
    return () => { cancelled = true }
  }, [apiQuery, search])

  // Map API properties to the structure expected by cards
  const normalized = serverFiltered.map((p: any) => ({
    id: p._id,
    title: p.name || p.title,
    location: p.location || "",
    price: typeof p.price === "number" ? p.price : Number(p.price || 0),
    roi: typeof p.roi === "number" ? p.roi : Number(p.roi || 0),
    duration: p.numberOfInstallments || p.duration || 0,
    image: p.image,
    funded: p.analytics?.fundingPercentage >= 100 || p.status === "Funded",
    type: (p.type || "").toString().toLowerCase(),
    deliveryDate: p.deliveryDate,
    rating: 4.6,
    reviews: 120,
  }));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center text-gray-500">
          Loading properties...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      {normalized.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
      {normalized.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          No properties match your filters.
        </div>
      )}
    </div>
  );
};

export default PropertyList;
