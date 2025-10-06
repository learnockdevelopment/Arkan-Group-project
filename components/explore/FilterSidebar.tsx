"use client";
import { useFilter } from "@/contexts/FilterContext";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

const FilterSidebar = () => {
  const { filters, updateFilter } = useFilter();

  const toggleValue = (key: keyof typeof filters, value: string) => {
    const current = filters[key] as string[];
    updateFilter(
      key,
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
    );
  };

  const Section = ({
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
  );

  return (
    <aside className="w-full sm:w-64 p-5 border rounded-2xl bg-white shadow-md space-y-6 transition-all duration-200 hover:shadow-lg">
      <Section title="Investment Range">
        <Slider
          value={filters.investmentRange}
          min={1000}
          max={50000}
          step={1000}
          onValueChange={(val) =>
            updateFilter("investmentRange", val as [number, number])
          }
        />
        <div className="text-xs text-gray-600 mt-2 font-medium">
          ${filters.investmentRange[0]} - ${filters.investmentRange[1]}
        </div>
      </Section>

      <Section title="Property Type">
        {["Residential", "Commercial", "Mixed-use"].map((type) => (
          <label
            key={type}
            className="flex items-center justify-between text-sm cursor-pointer hover:text-primary transition"
          >
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={filters.propertyType.includes(type)}
                onCheckedChange={() => toggleValue("propertyType", type)}
              />
              <span>{type}</span>
            </div>
          </label>
        ))}
      </Section>

      <Section title="Location">
        {["Cairo", "Giza", "Alexandria"].map((loc) => (
          <label
            key={loc}
            className="flex items-center justify-between text-sm cursor-pointer hover:text-primary transition"
          >
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={filters.location.includes(loc)}
                onCheckedChange={() => toggleValue("location", loc)}
              />
              <span>{loc}</span>
            </div>
          </label>
        ))}
      </Section>

      <Section title="Expected ROI">
        {["Low", "Mid", "High"].map((roi) => (
          <label
            key={roi}
            className="flex items-center justify-between text-sm cursor-pointer hover:text-primary transition"
          >
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={filters.expectedROI.includes(roi)}
                onCheckedChange={() => toggleValue("expectedROI", roi)}
              />
              <span>{roi}</span>
            </div>
          </label>
        ))}
      </Section>

      <Section title="Delivery Date">
        {["Ready", "Under construction"].map((date) => (
          <label
            key={date}
            className="flex items-center justify-between text-sm cursor-pointer hover:text-primary transition"
          >
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={filters.deliveryDate.includes(date)}
                onCheckedChange={() => toggleValue("deliveryDate", date)}
              />
              <span>{date}</span>
            </div>
          </label>
        ))}
      </Section>
    </aside>
  );
};

export default FilterSidebar;
