"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { allProperties } from "@/app/data/properties";
import { ChevronLeft, ChevronRight, DollarSign, ChartLine, MapPin, Building2, Shield, Star, Trophy, ChartPie } from "lucide-react";
import PropertyDetailsSidebar from "@/components/explore/PropertyDetailsSidebar";
import InvestmentDetails from "@/components/explore/Investment";
import ProjectTimeline from "@/components/explore/ProjectTimeline";

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const property = allProperties.find((p) => p.id === Number(id));
  const [activeTab, setActiveTab] = useState("Overview");
  const [currentImg, setCurrentImg] = useState(0);
  
  const highlightsImgs = [DollarSign, ChartLine, MapPin, Building2, Shield];
  const whyImgs = [Trophy, Star, ChartPie];

  if (!property) return <div className="text-center py-16">Property not found</div>;

  const nextImg = () =>
    setCurrentImg((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
  const prevImg = () =>
    setCurrentImg((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));

  return (
    <section className="grid grid-cols-3 px-6 py-16">
      <section className="lg:min-w-6xl mx-auto col-span-2 py-12 px-4">
        {/* Developer */}
        <div className="text-center mb-6">
          <span className="bg-yellow-100 px-4 py-1 rounded-full text-sm font-medium">
            {property.developer}
          </span>
          <h1 className="mt-8 font-semibold text-4xl">
            {property.name}
          </h1>
        </div>

        {/* Carousel */}
        <div className="relative w-full h-[420px] rounded-2xl overflow-hidden mb-8">
          <img
            src={property.images[currentImg]}
            alt={property.name}
            className="w-full h-full object-cover transition-all duration-500"
          />

          {/* Prev Button */}
          <button
            onClick={prevImg}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow"
          >
            <ChevronLeft />
          </button>

          {/* Next Button */}
          <button
            onClick={nextImg}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow"
          >
            <ChevronRight />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-3 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
            {currentImg + 1}/{property.images.length}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-around bg-gray-100 rounded-lg py-3 mb-6 text-sm font-medium">
          {["Overview", "Investment", "Timeline", "Documents"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-lg transition ${
                activeTab === tab ? "bg-white shadow text-blue-600" : "text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "Overview" && (
          <div className="space-y-8">
            {/* Highlights */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">Key Highlights</h2>
              <div className="grid md:grid-cols-5 gap-6 text-center">
                {property.keyHighlights.map((h, i) => {
                  const IconComponent = highlightsImgs[i] || DollarSign;
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div className="bg-blue-100 p-3 rounded-full mb-3">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-gray-500 text-sm mb-1">{h.label}</p>
                      <p className="font-semibold text-lg">{h.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Why invest */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Why invest in this project?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {property.reasonsToInvest.map((r, i) => {
                  const IconComponent = whyImgs[i] || Trophy;
                  return (
                    <div
                      key={i}
                      className="rounded-lg p-6 border hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex items-center mb-4">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                          <IconComponent className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-lg">{r.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{r.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* <p className="text-gray-700 mt-6 text-sm leading-relaxed bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                {property.marketDescription}
              </p> */}
            </div>

            {/* About */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">About this property</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">{property.about}</p>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 grid md:grid-cols-3 text-center gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <strong className="text-gray-800">Residential</strong>
                  <p className="text-sm text-gray-600 mt-1">{property.breakdown.residential}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <strong className="text-gray-800">Commercial</strong>
                  <p className="text-sm text-gray-600 mt-1">{property.breakdown.commercial}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <strong className="text-gray-800">Services</strong>
                  <p className="text-sm text-gray-600 mt-1">{property.breakdown.services}</p>
                </div>
              </div>
            </div>

            {/* Offers */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">What this property offers</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {property.offers.map((offer, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-gray-700">{offer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-6">Pricing Plans</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {property.pricingPlans.map((plan, i) => (
                  <div
                    key={i}
                    className="border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 bg-gradient-to-b from-white to-gray-50"
                  >
                    <h3 className="font-semibold text-lg mb-3">{plan.plan}</h3>
                    <p className="text-xl font-bold text-blue-700 mb-4">{plan.price}</p>
                    <ul className="text-sm text-gray-600 space-y-2">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center justify-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs Placeholder */}
        {activeTab !== "Timeline" && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
           <InvestmentDetails />
          </div>
        )}
        {activeTab !== "Investment" && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            <ProjectTimeline />
          </div>
        )}
        {activeTab !== "Documents" && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            Content for <b>{activeTab}</b> will go here later.
          </div>
        )}
      </section>
      <section className="col-span-1 mt-16">
        {/* Right sidebar content can go here */}
        <PropertyDetailsSidebar />
      </section>
    </section>
  );
}