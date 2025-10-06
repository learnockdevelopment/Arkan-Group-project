import React from "react";
import FeaturedBlog from "@/components/FeatureBlog";
import BlogCard from "@/components/BlogCard";

const blogs = [
  {
    id: 1,
    title: "5 FAQs on Hyde Park",
    description:
      "Before diving into the Hyde Park 6th Settlement master plan, let's ask you some questions. Have you heard of the 6th Settlement? It’s quickly becoming a coveted spot in New Cairo!",
    image: "/feature-blog.jpg",
  },
  {
    id: 2,
    title: "Is Single Unit Investment Right for You?",
    description:
      "Explore how single-unit investments compare to bundle investments in Egypt’s growing real estate market.",
    image: "/blog3.jpg",
  },
  {
    id: 3,
    title: "How Bundles Reduce Investment Risks.",
    description:
      "Learn how bundle investments can reduce exposure and maximize returns for investors in 2025.",
    image: "/blog2.jpg",
  },
  {
    id: 4,
    title: "The Benefits of Long-Term Full Project Investment.",
    description:
      "Why long-term investments in full real estate projects outperform short-term flipping strategies.",
    image: "/feature-blog.jpg",
  },
  {
    id: 5,
    title: "5 FAQs on Hyde Park",
    description:
      "Before diving into the Hyde Park 6th Settlement master plan, let's ask you some questions.",
    image: "/blog3.jpg",
  },
  {
    id: 6,
    title: "5 FAQs on Hyde Park",
    description:
      "Before diving into the Hyde Park 6th Settlement master plan, let's ask you some questions.",
    image: "/blog2.jpg",
  },
];

function page() {
  const featured = blogs[0];
  const rest = blogs.slice(1);

  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto mt-12 text-center">
        <p className="max-w-[100px] mx-auto bg-[#FFEBB1] rounded-full text-center font-medium mb-6">
          Blogs
        </p>
        <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold">
          Stay informed with the latest real estate news, market trends, and investment tips from Arkan Shares experts.
        </h1>
      </div>

      <div className="max-w-6xl mx-auto mt-12 space-y-12">
        {/* Featured Blog */}
        <FeaturedBlog
          image={featured.image}
          title={featured.title}
          description={featured.description}
        />

        {/* Blog Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {rest.map((blog) => (
            <BlogCard
              key={blog.id}
              image={blog.image}
              title={blog.title}
              description={blog.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default page;
