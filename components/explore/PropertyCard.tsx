import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Heart, Star ,ArrowRight } from "lucide-react";
import Link from "next/link";

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  roi: number;
  duration: number;
  funded?: boolean;
  image: string;
  rating: number;
  reviews: number;
}

const PropertyCard = ({ property }: { property: Property }) => {
  const { title, location, price, roi, duration, image, funded, rating, reviews } = property;

  return (
    <div className="flex flex-col sm:flex-row bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Section */}
      <div className="relative sm:w-1/3 w-full">
        <Image
          src={image}
          alt={title}
          width={400}
          height={250}
          className="object-cover w-full h-full"
        />
        {funded && (
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            Funded
          </span>
        )}
        <button className="absolute top-2 right-2 bg-white p-1 rounded-full shadow">
          <Heart className="w-5 h-5 text-red-500" />
        </button>
      </div>

      {/* Details Section */}
      <div className="flex flex-col justify-between p-4 sm:w-2/3">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-gray-500">{location}</p>

          <div className="text-sm text-gray-600 mt-2 space-y-1">
            <p className="flex items-center justify-between">
              <div className="font-medium">Expected ROI:</div> <div className="font-medium text-[#03770F]"> {roi}% </div>
            </p>
            <p className="flex items-center justify-between">
              <div className="font-medium">Duration:</div> <div  className="font-medium "> {duration} Months </div>
            </p>
          </div>

          {/* Rating Section */}
          <div className="flex items-center mt-3 space-x-1">
          <span className="text-sm text-black font-medium mr-2">({reviews} Reviews)</span>

            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex justify-between items-center mt-4">
          <span className="font-bold text-lg">${price.toLocaleString()}</span>
          <Link href={`/explore/${property.id}`}>
          <Button className="rounded-2xl !px-6 !py-3 text-base h-auto w-auto"> View Details <ArrowRight className="!w-5 !h-5" /></Button>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
