"use client";
import { useFilter } from "@/contexts/FilterContext";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Search } from "lucide-react";

const FilterHeader = () => {
  const { filters, updateFilter } = useFilter();

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 mb-6 mt-4">
      {/* Search Bar */}
      <div className="relative w-full sm:w-1/2 overflow-hidden">
        <Search className="absolute right-0  w-8 h-full p-2 rounded-r-lg bg-[#FBBC04] text-[#515151] overflow-hidden" />
        <Input
          type="text"
          placeholder="Search by property name or location..."
          value={filters.search || ""}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-4 pr-4 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition w-full"
        />
      </div>

      {/* Sort Dropdown */}
      <div className="w-full sm:w-40">
        <Select
          value={filters.sortBy || "default"}
          onValueChange={(value) => updateFilter("sortBy", value)}
        >
          <SelectTrigger className="relative rounded-lg border-gray-300 pr-12
  [&_svg]:absolute [&_svg]:right-0 [&_svg]:top-0 [&_svg]:h-full [&_svg]:w-8
  [&_svg]:p-2 [&_svg]:rounded-r-lg [&_svg]:bg-[#FBBC04] [&_svg]:text-[#515151]
  [&_svg]:opacity-100 [&_svg]:overflow-hidden">
  <SelectValue placeholder="Sort by" />
</SelectTrigger>

          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="priceLowHigh">Price: Low → High</SelectItem>
            <SelectItem value="priceHighLow">Price: High → Low</SelectItem>
            <SelectItem value="roiHighLow">ROI: High → Low</SelectItem>
            <SelectItem value="durationShortLong">Duration: Short → Long</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterHeader;
