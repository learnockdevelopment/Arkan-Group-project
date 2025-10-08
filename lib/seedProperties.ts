import { connectToDatabase } from "@/lib/db";
import { Property, PropertyType, PropertyStatus } from "@/models/Property";
import { User } from "@/models/User";
import { Role } from "@/models/Role";
import { ensureDefaultRoles } from "@/lib/roles";

export async function seedProperties() {
    try {
        await connectToDatabase();
        await ensureDefaultRoles();

        // Get or create admin and owner users
        const adminRole = await Role.findOne({ name: "admin" });
        const ownerRole = await Role.findOne({ name: "owner" });

        if (!adminRole || !ownerRole) {
            throw new Error("Roles not found. Please ensure roles are seeded first.");
        }

        // Create test admin user
        let adminUser = await User.findOne({ email: "admin@arkan.com" });
        if (!adminUser) {
            adminUser = new User({
                firstName: "Admin",
                lastName: "User",
                email: "admin@arkan.com",
                phone: "+201000000001",
                roleId: adminRole._id,
                status: "active",
                emailVerifiedAt: new Date(),
                phoneVerifiedAt: new Date()
            });
            await adminUser.save();
        }

        // Create test owner users
        let owner1 = await User.findOne({ email: "developer1@arkan.com" });
        if (!owner1) {
            owner1 = new User({
                firstName: "Ahmed",
                lastName: "Hassan",
                email: "developer1@arkan.com",
                phone: "+201000000002",
                roleId: ownerRole._id,
                status: "active",
                emailVerifiedAt: new Date(),
                phoneVerifiedAt: new Date()
            });
            await owner1.save();
        }

        let owner2 = await User.findOne({ email: "developer2@arkan.com" });
        if (!owner2) {
            owner2 = new User({
                firstName: "Fatima",
                lastName: "Ali",
                email: "developer2@arkan.com",
                phone: "+201000000003",
                roleId: ownerRole._id,
                status: "active",
                emailVerifiedAt: new Date(),
                phoneVerifiedAt: new Date()
            });
            await owner2.save();
        }

        let owner3 = await User.findOne({ email: "developer3@arkan.com" });
        if (!owner3) {
            owner3 = new User({
                firstName: "Mohamed",
                lastName: "Salah",
                email: "developer3@arkan.com",
                phone: "+201000000004",
                roleId: ownerRole._id,
                status: "active",
                emailVerifiedAt: new Date(),
                phoneVerifiedAt: new Date()
            });
            await owner3.save();
        }

        // Clear existing properties
        await Property.deleteMany({});

        // Single Properties Data
        const singleProperties = [
            {
                name: "Luxury Villa in New Cairo",
                type: PropertyType.SINGLE,
                developerId: owner1._id,
                location: "New Cairo, Egypt",
                image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&w=1000&q=80",
                images: [
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&w=1000&q=80",
                    "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&w=1000&q=80",
                    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&w=1000&q=80"
                ],
                landSize: "500 sqm",
                license: "Residential Development License",
                about: "A stunning luxury villa in the heart of New Cairo, featuring modern architecture and premium finishes. This property offers exceptional investment potential with guaranteed returns and prime location advantages.",
                offers: [
                    "Private Garden",
                    "Swimming Pool",
                    "Garage for 2 Cars",
                    "Security System",
                    "Modern Kitchen",
                    "Master Suite"
                ],
                status: PropertyStatus.AVAILABLE,
                keyHighlights: [
                    { label: "Property Value", value: "2.5M EGP" },
                    { label: "Expected Returns", value: "15% Annual" },
                    { label: "Land Size", value: "500 sqm" },
                    { label: "Built Area", value: "350 sqm" },
                    { label: "Delivery", value: "Q2 2025" }
                ],
                reasonsToInvest: [
                    {
                        title: "Prime Location",
                        desc: "Located in New Cairo's most prestigious neighborhood with excellent connectivity and infrastructure."
                    },
                    {
                        title: "High ROI",
                        desc: "Expected 15% annual returns based on market analysis and rental demand in the area."
                    },
                    {
                        title: "Quality Construction",
                        desc: "Built by renowned developers with premium materials and modern design standards."
                    }
                ],
                price: 2500000,
                priceType: "EGP",
                roi: 15,
                advancement: 25,
                totalShares: 50,
                maxSharesPerUser: 10,
                numberOfInstallments: 12,
                installmentsFrequency: "monthly",
                rooms: 4,
                bathrooms: 3,
                coordinates: {
                    latitude: 30.0444,
                    longitude: 31.2357
                },
                deliveryDate: new Date("2025-06-30"),
                deliveryStatus: PropertyStatus.UNDER_CONSTRUCTION,
                documents: [
                    {
                        title: "Property License",
                        url: "https://example.com/license.pdf"
                    },
                    {
                        title: "Floor Plans",
                        url: "https://example.com/floorplans.pdf"
                    }
                ],
                isFeatured: true
            },
            {
                name: "Modern Apartment in Zamalek",
                type: PropertyType.SINGLE,
                developerId: owner2._id,
                location: "Zamalek, Cairo, Egypt",
                image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&w=1000&q=80",
                images: [
                    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&w=1000&q=80",
                    "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&w=1000&q=80"
                ],
                landSize: "150 sqm",
                license: "Residential Unit License",
                about: "Elegant apartment in the prestigious Zamalek district, offering Nile views and premium amenities. Perfect for both living and investment with high rental demand.",
                offers: [
                    "Nile View",
                    "Balcony",
                    "Central AC",
                    "Concierge Service",
                    "Gym Access",
                    "Parking Space"
                ],
                status: PropertyStatus.AVAILABLE,
                keyHighlights: [
                    { label: "Property Value", value: "1.8M EGP" },
                    { label: "Expected Returns", value: "12% Annual" },
                    { label: "Area", value: "150 sqm" },
                    { label: "Floor", value: "8th Floor" },
                    { label: "View", value: "Nile View" }
                ],
                reasonsToInvest: [
                    {
                        title: "Premium Location",
                        desc: "Zamalek is Cairo's most exclusive district with consistent property value appreciation."
                    },
                    {
                        title: "Rental Demand",
                        desc: "High demand from expatriates and professionals ensures steady rental income."
                    },
                    {
                        title: "Nile Views",
                        desc: "Rare Nile-facing apartment with unobstructed views, adding premium value."
                    }
                ],
                price: 1800000,
                priceType: "EGP",
                roi: 12,
                advancement: 30,
                totalShares: 36,
                maxSharesPerUser: 6,
                numberOfInstallments: 10,
                installmentsFrequency: "monthly",
                rooms: 3,
                bathrooms: 2,
                coordinates: {
                    latitude: 30.0626,
                    longitude: 31.2497
                },
                deliveryDate: new Date("2025-03-31"),
                deliveryStatus: PropertyStatus.UNDER_CONSTRUCTION,
                documents: [
                    {
                        title: "Unit Contract",
                        url: "https://example.com/contract.pdf"
                    }
                ],
                isFeatured: false
            },
            {
                name: "Commercial Shop in Mall",
                type: PropertyType.SINGLE,
                developerId: owner3._id,
                location: "6th October City, Egypt",
                image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&w=1000&q=80",
                images: [
                    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&w=1000&q=80"
                ],
                landSize: "80 sqm",
                license: "Commercial License",
                about: "Prime commercial space in a busy shopping mall with high foot traffic. Excellent investment opportunity for retail business or rental income.",
                offers: [
                    "High Foot Traffic",
                    "Mall Amenities",
                    "Parking Available",
                    "Security 24/7",
                    "Central Location",
                    "Modern Facilities"
                ],
                status: PropertyStatus.AVAILABLE,
                keyHighlights: [
                    { label: "Property Value", value: "1.2M EGP" },
                    { label: "Expected Returns", value: "18% Annual" },
                    { label: "Area", value: "80 sqm" },
                    { label: "Location", value: "Ground Floor" },
                    { label: "Traffic", value: "High Footfall" }
                ],
                reasonsToInvest: [
                    {
                        title: "Commercial Returns",
                        desc: "Commercial properties typically offer higher returns than residential investments."
                    },
                    {
                        title: "Mall Location",
                        desc: "Located in a popular mall with established brands and consistent customer flow."
                    },
                    {
                        title: "Growth Area",
                        desc: "6th October City is rapidly developing with increasing commercial activity."
                    }
                ],
                price: 1200000,
                priceType: "EGP",
                roi: 18,
                advancement: 35,
                totalShares: 24,
                maxSharesPerUser: 4,
                numberOfInstallments: 8,
                installmentsFrequency: "monthly",
                rooms: 0,
                bathrooms: 1,
                coordinates: {
                    latitude: 29.9097,
                    longitude: 30.9746
                },
                deliveryDate: new Date("2025-01-31"),
                deliveryStatus: PropertyStatus.UNDER_CONSTRUCTION,
                documents: [
                    {
                        title: "Commercial License",
                        url: "https://example.com/commercial-license.pdf"
                    }
                ],
                isFeatured: false
            }
        ];

        // Create single properties first (needed for bundles)
        const createdSingleProperties = [];
        for (const propertyData of singleProperties) {
            // Pre-calculate values to ensure they're set
            const sharePrice = Math.round(propertyData.price / propertyData.totalShares);
            const shareDownPayment = Math.round((sharePrice * propertyData.advancement) / 100);
            const shareInstallment = Math.round((sharePrice - shareDownPayment) / propertyData.numberOfInstallments);
            
            const property = new Property({
                ...propertyData,
                sharePrice,
                shareDownPayment,
                shareInstallment,
                availableShares: propertyData.totalShares
            });
            
            await property.save();
            createdSingleProperties.push(property);
            console.log(`Created single property: ${property.name}`);
        }

        // Project Properties Data
        const projectProperties = [
            {
                name: "Al Alamein New City Development",
                type: PropertyType.PROJECT,
                developerId: adminUser._id,
                location: "Al Alamein, North Coast, Egypt",
                image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&w=1000&q=80",
                images: [
                    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&w=1000&q=80",
                    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&w=1000&q=80",
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&w=1000&q=80"
                ],
                landSize: "500 acres",
                license: "Mega Project Development License",
                about: "Massive integrated development project in Al Alamein New City featuring residential complexes, commercial centers, hotels, and entertainment facilities. This is a government-backed project with guaranteed returns and strategic importance.",
                offers: [
                    "Integrated Community",
                    "Beach Access",
                    "Commercial Centers",
                    "Hotels & Resorts",
                    "Educational Facilities",
                    "Healthcare Centers",
                    "Entertainment Complex",
                    "Marina & Yacht Club"
                ],
                status: PropertyStatus.AVAILABLE,
                keyHighlights: [
                    { label: "Project Value", value: "50B EGP" },
                    { label: "Expected Returns", value: "25% Annual" },
                    { label: "Land Size", value: "500 acres" },
                    { label: "Units", value: "10,000+ Units" },
                    { label: "Completion", value: "2028" }
                ],
                reasonsToInvest: [
                    {
                        title: "Government Backing",
                        desc: "Officially supported by the Egyptian government as part of the New Administrative Capital expansion."
                    },
                    {
                        title: "Strategic Location",
                        desc: "Located on the Mediterranean coast with direct access to international markets and tourism."
                    },
                    {
                        title: "Mega Project Scale",
                        desc: "Unprecedented scale offering diversified revenue streams and long-term appreciation potential."
                    }
                ],
                price: 50000000000, // 50 Billion EGP
                priceType: "EGP",
                roi: 25,
                advancement: 20,
                totalShares: 1000000, // 1 Million shares
                // No maxSharesPerUser for projects
                numberOfInstallments: 24,
                installmentsFrequency: "monthly",
                rooms: 0, // Mixed use project
                bathrooms: 0,
                coordinates: {
                    latitude: 30.8418,
                    longitude: 28.9519
                },
                deliveryDate: new Date("2028-12-31"),
                deliveryStatus: PropertyStatus.UNDER_CONSTRUCTION,
                projectValue: 50000000000,
                expectedReturns: 62500000000, // 25% return
                documents: [
                    {
                        title: "Government Approval",
                        url: "https://example.com/government-approval.pdf"
                    },
                    {
                        title: "Master Plan",
                        url: "https://example.com/master-plan.pdf"
                    },
                    {
                        title: "Environmental Impact Assessment",
                        url: "https://example.com/eia.pdf"
                    }
                ],
                isFeatured: true
            },
            {
                name: "Smart City Technology Hub",
                type: PropertyType.PROJECT,
                developerId: owner1._id,
                location: "New Administrative Capital, Egypt",
                image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&w=1000&q=80",
                images: [
                    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&w=1000&q=80",
                    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&w=1000&q=80"
                ],
                landSize: "200 acres",
                license: "Technology Park License",
                about: "Revolutionary technology hub in the New Administrative Capital featuring smart buildings, data centers, research facilities, and innovation labs. Designed to attract international tech companies and startups.",
                offers: [
                    "Smart Buildings",
                    "Data Centers",
                    "Research Labs",
                    "Innovation Hubs",
                    "Conference Centers",
                    "Tech Incubators",
                    "High-Speed Connectivity",
                    "Green Energy Systems"
                ],
                status: PropertyStatus.AVAILABLE,
                keyHighlights: [
                    { label: "Project Value", value: "15B EGP" },
                    { label: "Expected Returns", value: "30% Annual" },
                    { label: "Land Size", value: "200 acres" },
                    { label: "Tech Companies", value: "500+ Expected" },
                    { label: "Jobs Created", value: "50,000+" }
                ],
                reasonsToInvest: [
                    {
                        title: "Technology Focus",
                        desc: "First dedicated technology hub in Egypt, positioned to capture the growing tech sector."
                    },
                    {
                        title: "Government Support",
                        desc: "Part of Egypt's digital transformation initiative with tax incentives and support."
                    },
                    {
                        title: "International Appeal",
                        desc: "Designed to international standards to attract global tech companies and investments."
                    }
                ],
                price: 15000000000, // 15 Billion EGP
                priceType: "EGP",
                roi: 30,
                advancement: 15,
                totalShares: 300000,
                numberOfInstallments: 18,
                installmentsFrequency: "monthly",
                rooms: 0,
                bathrooms: 0,
                coordinates: {
                    latitude: 30.0131,
                    longitude: 31.7336
                },
                deliveryDate: new Date("2027-06-30"),
                deliveryStatus: PropertyStatus.UNDER_CONSTRUCTION,
                projectValue: 15000000000,
                expectedReturns: 19500000000,
                documents: [
                    {
                        title: "Technology License",
                        url: "https://example.com/tech-license.pdf"
                    },
                    {
                        title: "Infrastructure Plan",
                        url: "https://example.com/infrastructure.pdf"
                    }
                ],
                isFeatured: true
            }
        ];

        // Create project properties
        for (const propertyData of projectProperties) {
            // Pre-calculate values to ensure they're set
            const sharePrice = Math.round(propertyData.price / propertyData.totalShares);
            const shareDownPayment = Math.round((sharePrice * propertyData.advancement) / 100);
            const shareInstallment = Math.round((sharePrice - shareDownPayment) / propertyData.numberOfInstallments);
            
            const property = new Property({
                ...propertyData,
                sharePrice,
                shareDownPayment,
                shareInstallment,
                availableShares: propertyData.totalShares
            });
            
            await property.save();
            console.log(`Created project: ${property.name}`);
        }

        // Bundle Properties Data
        const bundleProperties = [
            {
                name: "Cairo Premium Portfolio Bundle",
                type: PropertyType.BUNDLE,
                developerId: owner2._id,
                location: "Multiple Locations, Cairo, Egypt",
                image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&w=1000&q=80",
                images: [
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&w=1000&q=80",
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&w=1000&q=80",
                    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&w=1000&q=80"
                ],
                landSize: "Combined 730 sqm",
                license: "Portfolio Investment License",
                about: "Diversified real estate portfolio combining premium residential and commercial properties across Cairo's most sought-after locations. This bundle offers reduced risk through diversification and multiple income streams.",
                offers: [
                    "Diversified Portfolio",
                    "Multiple Income Streams",
                    "Risk Mitigation",
                    "Professional Management",
                    "Prime Locations",
                    "Mixed Asset Types",
                    "Guaranteed Returns",
                    "Exit Flexibility"
                ],
                status: PropertyStatus.AVAILABLE,
                keyHighlights: [
                    { label: "Bundle Value", value: "5.5M EGP" },
                    { label: "Expected Returns", value: "16% Annual" },
                    { label: "Properties Included", value: "3 Units" },
                    { label: "Locations", value: "Premium Areas" },
                    { label: "Asset Mix", value: "Residential + Commercial" }
                ],
                reasonsToInvest: [
                    {
                        title: "Diversification",
                        desc: "Spread investment risk across multiple properties and asset types for stable returns."
                    },
                    {
                        title: "Professional Management",
                        desc: "Professionally managed portfolio with experienced property management team."
                    },
                    {
                        title: "Premium Locations",
                        desc: "All properties located in Cairo's most prestigious and high-demand areas."
                    }
                ],
                price: 5500000, // Combined value of included properties
                priceType: "EGP",
                roi: 16,
                advancement: 25,
                totalShares: 110, // Combined shares
                maxSharesPerUser: 20,
                numberOfInstallments: 15,
                installmentsFrequency: "monthly",
                rooms: 7, // Combined rooms
                bathrooms: 6, // Combined bathrooms
                coordinates: {
                    latitude: 30.0444, // Central Cairo coordinate
                    longitude: 31.2357
                },
                deliveryDate: new Date("2025-06-30"),
                deliveryStatus: PropertyStatus.UNDER_CONSTRUCTION,
                bundleProperties: [
                    createdSingleProperties[0]._id, // Luxury Villa
                    createdSingleProperties[1]._id, // Modern Apartment
                    createdSingleProperties[2]._id  // Commercial Shop
                ],
                bundleSize: 3,
                documents: [
                    {
                        title: "Bundle Agreement",
                        url: "https://example.com/bundle-agreement.pdf"
                    },
                    {
                        title: "Portfolio Analysis",
                        url: "https://example.com/portfolio-analysis.pdf"
                    },
                    {
                        title: "Management Contract",
                        url: "https://example.com/management-contract.pdf"
                    }
                ],
                isFeatured: true
            },
            {
                name: "North Coast Resort Bundle",
                type: PropertyType.BUNDLE,
                developerId: owner3._id,
                location: "North Coast, Egypt",
                image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&w=1000&q=80",
                images: [
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&w=1000&q=80",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&w=1000&q=80"
                ],
                landSize: "Multiple beachfront locations",
                license: "Resort Development Bundle License",
                about: "Exclusive collection of beachfront properties and resort facilities along Egypt's pristine North Coast. Perfect for seasonal rental income and long-term appreciation in the tourism sector.",
                offers: [
                    "Beachfront Access",
                    "Resort Amenities",
                    "Seasonal Rentals",
                    "Tourism Income",
                    "Beach Clubs",
                    "Water Sports",
                    "Luxury Finishes",
                    "Concierge Services"
                ],
                status: PropertyStatus.AVAILABLE,
                keyHighlights: [
                    { label: "Bundle Value", value: "8.5M EGP" },
                    { label: "Expected Returns", value: "20% Annual" },
                    { label: "Properties", value: "5 Beach Units" },
                    { label: "Beach Access", value: "Private Beaches" },
                    { label: "Season", value: "Year-round Income" }
                ],
                reasonsToInvest: [
                    {
                        title: "Tourism Growth",
                        desc: "North Coast tourism is booming with increasing domestic and international visitors."
                    },
                    {
                        title: "Seasonal Premium",
                        desc: "Beachfront properties command premium rates during peak seasons."
                    },
                    {
                        title: "Limited Supply",
                        desc: "Beachfront land is limited, ensuring long-term value appreciation."
                    }
                ],
                price: 8500000,
                priceType: "EGP",
                roi: 20,
                advancement: 30,
                totalShares: 170,
                maxSharesPerUser: 25,
                numberOfInstallments: 20,
                installmentsFrequency: "monthly",
                rooms: 15, // Combined rooms across properties
                bathrooms: 12,
                coordinates: {
                    latitude: 31.0409,
                    longitude: 27.2490
                },
                deliveryDate: new Date("2026-03-31"),
                deliveryStatus: PropertyStatus.UNDER_CONSTRUCTION,
                bundleProperties: [], // Would reference actual beach properties
                bundleSize: 5,
                documents: [
                    {
                        title: "Resort Bundle License",
                        url: "https://example.com/resort-bundle.pdf"
                    },
                    {
                        title: "Tourism Revenue Analysis",
                        url: "https://example.com/tourism-analysis.pdf"
                    }
                ],
                isFeatured: false
            }
        ];

        // Create bundle properties
        for (const propertyData of bundleProperties) {
            // Pre-calculate values to ensure they're set
            const sharePrice = Math.round(propertyData.price / propertyData.totalShares);
            const shareDownPayment = Math.round((sharePrice * propertyData.advancement) / 100);
            const shareInstallment = Math.round((sharePrice - shareDownPayment) / propertyData.numberOfInstallments);
            
            const property = new Property({
                ...propertyData,
                sharePrice,
                shareDownPayment,
                shareInstallment,
                availableShares: propertyData.totalShares
            });
            
            await property.save();
            console.log(`Created bundle: ${property.name}`);
        }

        console.log("✅ Property seeding completed successfully!");
        
        // Return summary
        const summary = {
            singleProperties: singleProperties.length,
            projects: projectProperties.length,
            bundles: bundleProperties.length,
            totalProperties: singleProperties.length + projectProperties.length + bundleProperties.length,
            users: {
                admin: 1,
                owners: 3
            }
        };

        return summary;

    } catch (error) {
        console.error("❌ Error seeding properties:", error);
        throw error;
    }
}
