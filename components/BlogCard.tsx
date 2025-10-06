import React from "react";
import Image from "next/image";

const BlogCard = ({ image, title, description }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      <Image
        src={image}
        alt={title}
        width={400}
        height={250}
        className="w-full h-48 object-cover"
      />
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <button className="text-blue-600 font-medium flex items-center gap-1 hover:underline">
          Read More <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default BlogCard;
