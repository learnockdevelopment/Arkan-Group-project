"use client";
import { useExploreFilter } from "@/contexts/ExploreFilterContext";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useMemo } from "react";

const FilterSidebar = () => {
  const { filters, setFilters, clearFilters } = useExploreFilter();

  // Local slider state for smooth UI
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([
    filters.minPrice || 1000,
    filters.maxPrice || 1000000000,
  ]);

  // Store timeout ref to avoid recreation
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with external changes
  useEffect(() => {
    setLocalPriceRange([
      filters.minPrice || 1000,
      filters.maxPrice || 1000000000,
    ]);
  }, [filters.minPrice, filters.maxPrice]);

  // Debounced setter — very lightweight and stable
  const updateFilters = (min: number, max: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters({ minPrice: min, maxPrice: max });
    }, 300);
  };

  const handleSliderChange = (value: number[]) => {
    const [min, max] = value as [number, number];
    // Only update local state — super fast
    setLocalPriceRange([min, max]);
    // Update filters in background (debounced)
    updateFilters(min, max);
  };

  // Small helper for cleaner section layout
  const Section = useMemo(
    () =>
      ({
        title,
        children,
      }: {
        title: string;
        children: React.ReactNode;
      }) => (
        <div className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:mb-0">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
            {title}
          </h3>
          <div className="space-y-2">{children}</div>
        </div>
      ),
    []
  );

  return (
    <aside className="w-full sm:w-64 p-5 border rounded-2xl bg-white shadow-md space-y-6 transition-all duration-200 hover:shadow-lg">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg">Filters</h2>
        <Button variant="outline" size="sm" onClick={clearFilters}>
          Clear All
        </Button>
      </div>

      {/* 💰 Smooth Price Slider */}
      <Section title="Investment Range">
        <Slider
          value={localPriceRange}
          min={1000}
          max={100000000}
          step={1000}
          onValueChange={handleSliderChange}
        />
        <div className="text-xs text-gray-600 mt-2 font-medium">
          ${localPriceRange[0].toLocaleString()} - $
          {localPriceRange[1].toLocaleString()}
        </div>
      </Section>

      {/* Property Type */}
      <Section title="Property Type">
        {[
          { label: "Single Property", value: "single" },
          { label: "Project", value: "project" },
          { label: "Bundle", value: "bundle" },
        ].map((opt) => (
          <label
            key={opt.value}
            className="flex items-center justify-between text-sm cursor-pointer hover:text-primary transition"
          >
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={filters.type === opt.value}
                onCheckedChange={() =>
                  setFilters({
                    type: filters.type === opt.value ? undefined : opt.value,
                  })
                }
              />
              <span>{opt.label}</span>
            </div>
          </label>
        ))}
      </Section>

      {/* Location */}
      <Section title="Location">
        {["Cairo", "Giza", "Alexandria", "New Cairo", "6th of October"].map(
          (loc) => (
            <label
              key={loc}
              className="flex items-center justify-between text-sm cursor-pointer hover:text-primary transition"
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.location === loc}
                  onCheckedChange={() =>
                    setFilters({
                      location: filters.location === loc ? undefined : loc,
                    })
                  }
                />
                <span>{loc}</span>
              </div>
            </label>
          )
        )}
      </Section>

      {/* ROI */}
      <Section title="Expected ROI">
        {[
          { label: "Low (0-9%)", value: "low" },
          { label: "Mid (10-19%)", value: "mid" },
          { label: "High (20%+)", value: "high" },
        ].map((opt) => {
          const isLow = opt.value === "low" && (filters.maxRoi || 0) === 9;
          const isMid =
            opt.value === "mid" &&
            (filters.minRoi || 0) === 10 &&
            (filters.maxRoi || 0) === 19;
          const isHigh = opt.value === "high" && (filters.minRoi || 0) === 20;
          const isChecked = isLow || isMid || isHigh;

          return (
            <label
              key={opt.value}
              className="flex items-center justify-between text-sm cursor-pointer hover:text-primary transition"
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => {
                    if (isChecked) {
                      setFilters({ minRoi: undefined, maxRoi: undefined });
                    } else {
                      if (opt.value === "low")
                        setFilters({ minRoi: undefined, maxRoi: 9 });
                      if (opt.value === "mid")
                        setFilters({ minRoi: 10, maxRoi: 19 });
                      if (opt.value === "high")
                        setFilters({ minRoi: 20, maxRoi: undefined });
                    }
                  }}
                />
                <span>{opt.label}</span>
              </div>
            </label>
          );
        })}
      </Section>

      {/* Status */}
      <Section title="Status">
        {["Available", "Funded", "Under Development"].map((status) => (
          <label
            key={status}
            className="flex items-center justify-between text-sm cursor-pointer hover:text-primary transition"
          >
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={filters.status === status}
                onCheckedChange={() =>
                  setFilters({
                    status: filters.status === status ? undefined : status,
                  })
                }
              />
              <span>{status}</span>
            </div>
          </label>
        ))}
      </Section>

      {/* Options */}
      <Section title="Options">
        <label className="flex items-center justify-between text-sm cursor-pointer hover:text-primary transition">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={filters.available === true}
              onCheckedChange={() =>
                setFilters({
                  available: filters.available === true ? undefined : true,
                })
              }
            />
            <span>Available Only</span>
          </div>
        </label>
        <label className="flex items-center justify-between text-sm cursor-pointer hover:text-primary transition">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={filters.featured === true}
              onCheckedChange={() =>
                setFilters({
                  featured: filters.featured === true ? undefined : true,
                })
              }
            />
            <span>Featured Only</span>
          </div>
        </label>
      </Section>

      {/* Sort */}
      <Section title="Sort By">
        {[
          { label: "Price: Low to High", sortBy: "price", sortOrder: "asc" },
          { label: "Price: High to Low", sortBy: "price", sortOrder: "desc" },
          { label: "ROI: High to Low", sortBy: "roi", sortOrder: "desc" },
          { label: "Newest First", sortBy: "createdAt", sortOrder: "desc" },
        ].map((opt) => {
          const isChecked =
            filters.sortBy === opt.sortBy && filters.sortOrder === opt.sortOrder;

          return (
            <label
              key={opt.label}
              className="flex items-center justify-between text-sm cursor-pointer hover:text-primary transition"
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => {
                    if (isChecked) {
                      setFilters({ sortBy: undefined, sortOrder: undefined });
                    } else {
                      setFilters({
                        sortBy: opt.sortBy,
                        sortOrder: opt.sortOrder as any,
                      });
                    }
                  }}
                />
                <span>{opt.label}</span>
              </div>
            </label>
          );
        })}
      </Section>
    </aside>
  );
};

export default FilterSidebar;
