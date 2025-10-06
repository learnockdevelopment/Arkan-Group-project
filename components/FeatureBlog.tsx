import React from "react";
import Image from "next/image";

const FeaturedBlog = ({ image, title, description }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      <Image
        src={image}
        alt={title}
        width={1200}
        height={500}
        className="w-full h-80 object-cover"
      />
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-3">{title}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        <button className="text-blue-600 font-medium flex items-center gap-1 hover:underline">
          Read More <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default FeaturedBlog;
