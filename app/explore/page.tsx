import FilterSidebar from "@/components/explore/FilterSidebar";
import FilterHeader from "@/components/explore/FilterHeader";
import PropertyList from "@/components/explore/PropertyList";
import { FilterProvider } from "@/contexts/FilterContext";

export default function ExplorePage() {
  return (
    <FilterProvider>
      <section className="py-12  bg-gray-50 min-h-screen max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">
          Discover the right investment for you
        </h1>
        <FilterHeader />

        <div className="flex flex-col md:flex-row gap-8">
          <FilterSidebar />
          <PropertyList />
        </div>
      </section>
    </FilterProvider>
  );
}
