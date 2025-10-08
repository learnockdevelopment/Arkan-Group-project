"use client";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useProperties } from "@/contexts/PropertiesContext";
import { ChevronLeft, ChevronRight, DollarSign, ChartLine, MapPin, Building2, Shield, Star, Trophy, ChartPie } from "lucide-react";
import PropertyDetailsSidebar from "@/components/explore/PropertyDetailsSidebar";
import InvestmentDetails from "@/components/explore/Investment";
import ProjectTimeline from "@/components/explore/ProjectTimeline";

export default function PropertyDetailsPage() {
  const params = useParams();
  const id = params?.id;
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [currentImg, setCurrentImg] = useState(0);
  
  const highlightsImgs = [DollarSign, ChartLine, MapPin, Building2, Shield];
  const whyImgs = [Trophy, Star, ChartPie];

  // Fetch individual property details from API
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
     
        
        if (!id) {
          throw new Error('Property ID is required');
        }

        const apiKey = process.env.NEXT_PUBLIC_API_KEY;
        
        if (!apiKey) {
          throw new Error('API key not configured');
        }

        
        const response = await fetch(`/api/properties/${id}`, {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        });


        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Property not found');
          }
          throw new Error(`Failed to fetch property: ${response.status}`);
        }

        const data = await response.json();
       console.log("data",data)
        
        if (data.success && data.data) {
          console.log('✅ Property details fetched successfully:', data.data);
          setProperty(data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('❌ Error fetching property details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetails();
    } else {
      console.log('No ID provided, cannot fetch property details');
      setError('Property ID is required');
      setLoading(false);
    }
  }, [id]);


  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading property details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Error Loading Property</h2>
        <p className="text-gray-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Property not found</h2>
        <p className="text-gray-600">The property you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const nextImg = () => {
    if (!property) return;
    const images = property.images || [property.image].filter(Boolean);
    setCurrentImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  const prevImg = () => {
    if (!property) return;
    const images = property.images || [property.image].filter(Boolean);
    setCurrentImg((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <section className="grid grid-cols-3 px-6 py-16">
      <section className="lg:min-w-6xl mx-auto col-span-2 py-12 px-4">
        {/* Developer */}
        <div className="text-center mb-6">
          <span className="bg-yellow-100 px-4 py-1 rounded-full text-sm font-medium">
            {property.developerId?.firstName && property.developerId?.lastName 
              ? `${property.developerId.firstName} ${property.developerId.lastName}`
              : "Premium Developer"
            }
          </span>
          <h1 className="mt-8 font-semibold text-4xl">
            {property.name}
          </h1>
        </div>

        {/* Carousel */}
        <div className="relative w-full h-[420px] rounded-2xl overflow-hidden mb-8">
          {(() => {
            if (!property) return null;
            
            const images = property.images || [property.image].filter(Boolean);
            const currentImage = images[currentImg] || property.image || "/placeholder.jpg";
            
            return (
              <>
                <img
                  src={currentImage}
                  alt={property.name || "Property"}
                  className="w-full h-full object-cover transition-all duration-500"
                />

                {/* Navigation buttons only if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow"
                    >
                      <ChevronLeft />
                    </button>

                    <button
                      onClick={nextImg}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow"
                    >
                      <ChevronRight />
                    </button>

                    <div className="absolute bottom-3 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                      {currentImg + 1}/{images.length}
                    </div>
                  </>
                )}
              </>
            );
          })()}
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
                {property.keyHighlights?.map((h: any, i: number) => {
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
                }) || [
                  { label: "Project Value", value: property.price ? `${(property.price ).toFixed(1)} EGP` : "N/A" },
                  { label: "Expected ROI", value: property.roi ? `${property.roi}%` : "N/A" },
                  { label: "Location", value: property.location || "N/A" },
                  { label: "Type", value: property.type || "N/A" },
                  { label: "Available Shares", value: property.availableShares ? property.availableShares.toLocaleString() : "N/A" }
                ].map((h: any, i: number) => {
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
                {property.reasonsToInvest?.map((r: any, i: number) => {
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
                }) || [
                  { title: "High ROI Potential", desc: "This property offers excellent return on investment opportunities in a prime location." },
                  { title: "Prime Location", desc: "Strategically located in a high-demand area with excellent growth potential." },
                  { title: "Secure Investment", desc: "Backed by a reputable developer with a proven track record of successful projects." }
                ].map((r: any, i: number) => {
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
            </div>

            {/* About */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">About this property</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {property.about || property.description || "This is an excellent investment opportunity in a prime location. The property offers great potential for capital appreciation and rental income."}
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 grid md:grid-cols-3 text-center gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <strong className="text-gray-800">Share Price</strong>
                  <p className="text-sm text-gray-600 mt-1">{property.sharePrice ? `${property.sharePrice.toLocaleString()} EGP` : "N/A"}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <strong className="text-gray-800">Total Shares</strong>
                  <p className="text-sm text-gray-600 mt-1">{property.totalShares ? property.totalShares.toLocaleString() : "N/A"}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <strong className="text-gray-800">Available Shares</strong>
                  <p className="text-sm text-gray-600 mt-1">{property.availableShares ? property.availableShares.toLocaleString() : "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Offers */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">What this property offers</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {property.offers?.map((offer: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-gray-700">{offer}</p>
                  </div>
                )) || [
                  "Prime location with excellent connectivity",
                  "High potential for capital appreciation",
                  "Strong rental yield opportunities",
                  "Modern amenities and facilities",
                  "Secure investment with developer guarantee",
                  "Flexible payment plans available"
                ].map((offer: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-gray-700">{offer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-6">Investment Details</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {property.pricingPlans?.map((plan: any, i: number) => (
                  <div
                    key={i}
                    className="border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 bg-gradient-to-b from-white to-gray-50"
                  >
                    <h3 className="font-semibold text-lg mb-3">{plan.plan}</h3>
                    <p className="text-xl font-bold text-blue-700 mb-4">{plan.price}</p>
                    <ul className="text-sm text-gray-600 space-y-2">
                      {plan.features.map((f: any, i: number) => (
                        <li key={i} className="flex items-center justify-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )) || [
                  {
                    plan: "Share Investment",
                    price: property.sharePrice ? `${property.sharePrice.toLocaleString()} EGP per share` : "Contact for pricing",
                    features: [
                      `Minimum ${property.shareDownPayment ? property.shareDownPayment.toLocaleString() : 'N/A'} EGP down payment`,
                      `${property.numberOfInstallments || 'N/A'} monthly installments`,
                      `Expected ${property.roi || 'N/A'}% ROI`
                    ]
                  },
                  {
                    plan: "Payment Structure", 
                    price: property.shareInstallment ? `${property.shareInstallment.toLocaleString()} EGP per month` : "Flexible payment",
                    features: [
                      `Down payment: ${property.shareDownPayment ? property.shareDownPayment.toLocaleString() : 'N/A'} EGP`,
                      `Monthly: ${property.shareInstallment ? property.shareInstallment.toLocaleString() : 'N/A'} EGP`,
                      `Frequency: ${property.installmentsFrequency || 'Monthly'}`
                    ]
                  },
                  {
                    plan: "Investment Details",
                    price: property.deliveryDate ? `Delivery: ${new Date(property.deliveryDate).toLocaleDateString()}` : "Contact for timeline",
                    features: [
                      `Max shares per user: ${property.maxSharesPerUser || 'N/A'}`,
                      `Available shares: ${property.availableShares ? property.availableShares.toLocaleString() : 'N/A'}`,
                      `Total property value: ${property.price ? (property.price / 1000000000).toFixed(1) + ' EGP' : 'N/A'}`
                    ]
                  }
                ].map((plan: any, i: number) => (
                  <div
                    key={i}
                    className="border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 bg-gradient-to-b from-white to-gray-50"
                  >
                    <h3 className="font-semibold text-lg mb-3">{plan.plan}</h3>
                    <p className="text-xl font-bold text-blue-700 mb-4">{plan.price}</p>
                    <ul className="text-sm text-gray-600 space-y-2">
                      {plan.features.map((f: any, i: number) => (
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

        {/* Investment Tab */}
        {activeTab === "Investment" && (
          <div className="bg-white rounded-xl shadow p-6">
            <InvestmentDetails />
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === "Timeline" && (
          <div className="bg-white rounded-xl shadow p-6">
            <ProjectTimeline />
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "Documents" && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Property Documents</h2>
            <p className="text-gray-600 mb-6">Important documents and legal papers related to this property.</p>
            {property.documents && property.documents.length > 0 ? (
              <div className="space-y-4">
                {property.documents.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.title}</h3>
                        <p className="text-sm text-gray-500">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View Document
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">No documents available at this time.</p>
                <p className="text-sm text-gray-400 mt-1">Documents will be uploaded by the developer soon.</p>
              </div>
            )}
          </div>
        )}
      </section>
      <section className="col-span-1 mt-16">
        {/* Right sidebar content can go here */}
        <PropertyDetailsSidebar property={property} />
      </section>
    </section>
  );
}