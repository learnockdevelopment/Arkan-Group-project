"use client";
import { useExploreFilter } from "@/contexts/ExploreFilterContext";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const FilterHeader = () => {
  const { filters, setFilters } = useExploreFilter();

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 mb-6 mt-4">
      {/* Search Bar */}
      <div className="relative w-full sm:w-1/2 overflow-hidden">
        <Search className="absolute right-0 w-8 h-full p-2 rounded-r-lg bg-[#FBBC04] text-[#515151] overflow-hidden" />
        <Input
          type="text"
          placeholder="Search by property name or location..."
          value={filters.search || ""}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="pl-4 pr-4 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition w-full"
        />
      </div>
    </div>
  );
};

export default FilterHeader;