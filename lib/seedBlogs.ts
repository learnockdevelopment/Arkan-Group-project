import { connectToDatabase } from "@/lib/db";
import { Blog, BlogCategory, BlogStatus } from "@/models/Blog";
import { User } from "@/models/User";
import { Role } from "@/models/Role";

export async function seedBlogs() {
    try {
        await connectToDatabase();

        // Get admin users to be blog authors
        const adminRole = await Role.findOne({ name: "admin" });
        if (!adminRole) {
            throw new Error("Admin role not found. Please ensure roles are seeded first.");
        }

        let adminUsers = await User.find({ roleId: adminRole._id }).limit(3);
        
        // If no admin users found, create some for blog authoring
        if (adminUsers.length === 0) {
            console.log("No admin users found, creating blog authors...");
            
            const blogAuthors = [
                {
                    firstName: "Blog",
                    lastName: "Admin",
                    email: "blog.admin@arkan.com",
                    phone: "+201000000010",
                    roleId: adminRole._id,
                    status: "active",
                    emailVerifiedAt: new Date(),
                    phoneVerifiedAt: new Date()
                },
                {
                    firstName: "Content",
                    lastName: "Manager",
                    email: "content.manager@arkan.com",
                    phone: "+201000000011",
                    roleId: adminRole._id,
                    status: "active",
                    emailVerifiedAt: new Date(),
                    phoneVerifiedAt: new Date()
                },
                {
                    firstName: "Marketing",
                    lastName: "Team",
                    email: "marketing@arkan.com",
                    phone: "+201000000012",
                    roleId: adminRole._id,
                    status: "active",
                    emailVerifiedAt: new Date(),
                    phoneVerifiedAt: new Date()
                }
            ];

            for (const authorData of blogAuthors) {
                const existingUser = await User.findOne({ email: authorData.email });
                if (!existingUser) {
                    const author = new User(authorData);
                    await author.save();
                    adminUsers.push(author);
                } else {
                    adminUsers.push(existingUser);
                }
            }
        }

        // Ensure we have at least 3 admin users for blog authoring
        while (adminUsers.length < 3) {
            adminUsers.push(adminUsers[0]); // Duplicate first admin if needed
        }

        // Clear existing blogs
        await Blog.deleteMany({});

        // Sample blog posts data
        const blogPosts = [
            {
                title: "The Future of Real Estate Investment in Egypt",
                slug: "future-real-estate-investment-egypt",
                excerpt: "Discover the emerging trends and opportunities in Egypt's real estate market, from smart cities to sustainable developments.",
                content: `
                <h2>Introduction</h2>
                <p>Egypt's real estate market is undergoing a significant transformation, driven by government initiatives, technological advancements, and changing investor preferences. As we look toward the future, several key trends are shaping the landscape of property investment in the country.</p>
                
                <h2>Smart Cities and Technology Integration</h2>
                <p>The development of smart cities like the New Administrative Capital represents a paradigm shift in urban planning. These projects integrate cutting-edge technology with sustainable design principles, creating investment opportunities that didn't exist just a decade ago.</p>
                
                <h2>Sustainable Development Focus</h2>
                <p>Environmental consciousness is becoming increasingly important in real estate development. Green buildings, energy-efficient systems, and sustainable materials are no longer luxury features but essential components of modern developments.</p>
                
                <h2>Digital Investment Platforms</h2>
                <p>The rise of digital platforms has democratized real estate investment, allowing smaller investors to participate in high-value projects through fractional ownership models. This trend is expected to continue growing significantly.</p>
                
                <h2>Government Initiatives</h2>
                <p>The Egyptian government's Vision 2030 includes ambitious infrastructure projects that are creating new investment corridors and opportunities for both local and international investors.</p>
                
                <h2>Conclusion</h2>
                <p>The future of real estate investment in Egypt looks promising, with technology, sustainability, and government support creating a favorable environment for growth and innovation.</p>
                `,
                featuredImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&w=1000&q=80",
                images: [
                    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&w=1000&q=80",
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&w=1000&q=80"
                ],
                category: BlogCategory.REAL_ESTATE,
                tags: ["real estate", "egypt", "investment", "smart cities", "technology"],
                status: BlogStatus.PUBLISHED,
                authorId: adminUsers[0]._id,
                isFeatured: true,
                metaTitle: "Future of Real Estate Investment in Egypt - Arkan",
                metaDescription: "Explore emerging trends in Egypt's real estate market including smart cities, sustainable development, and digital investment platforms.",
                keywords: ["real estate egypt", "property investment", "smart cities", "sustainable development"]
            },
            {
                title: "Understanding Fractional Real Estate Ownership",
                slug: "understanding-fractional-real-estate-ownership",
                excerpt: "Learn how fractional ownership is revolutionizing real estate investment, making premium properties accessible to more investors.",
                content: `
                <h2>What is Fractional Ownership?</h2>
                <p>Fractional ownership allows multiple investors to own shares in a single property, making high-value real estate investments accessible to a broader range of investors. This innovative approach is transforming how people think about property investment.</p>
                
                <h2>Benefits of Fractional Ownership</h2>
                <h3>Lower Entry Barriers</h3>
                <p>Instead of needing millions to invest in premium properties, fractional ownership allows you to start with much smaller amounts while still gaining exposure to high-quality real estate.</p>
                
                <h3>Diversification</h3>
                <p>With fractional ownership, you can spread your investment across multiple properties and locations, reducing risk and increasing potential returns.</p>
                
                <h3>Professional Management</h3>
                <p>Properties are typically managed by professional teams, removing the burden of day-to-day management from individual investors.</p>
                
                <h2>How It Works</h2>
                <p>The process is straightforward: properties are divided into shares, investors purchase the number of shares they want, and returns are distributed proportionally based on ownership percentage.</p>
                
                <h2>Considerations</h2>
                <p>While fractional ownership offers many benefits, investors should consider factors like liquidity, management fees, and the quality of the platform facilitating the investment.</p>
                `,
                featuredImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&w=1000&q=80",
                images: [
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&w=1000&q=80"
                ],
                category: BlogCategory.INVESTMENT,
                tags: ["fractional ownership", "investment", "real estate", "shares", "diversification"],
                status: BlogStatus.PUBLISHED,
                authorId: adminUsers[1]._id,
                isFeatured: true,
                metaTitle: "Fractional Real Estate Ownership Guide - Arkan",
                metaDescription: "Complete guide to fractional real estate ownership, benefits, how it works, and key considerations for investors.",
                keywords: ["fractional ownership", "real estate investment", "property shares", "investment guide"]
            },
            {
                title: "Top 5 Investment Tips for First-Time Property Buyers",
                slug: "top-5-investment-tips-first-time-property-buyers",
                excerpt: "Essential advice for newcomers to real estate investment, covering research, financing, location analysis, and risk management.",
                content: `
                <h2>1. Research the Market Thoroughly</h2>
                <p>Before making any investment, spend time understanding the local market conditions, price trends, and future development plans. Knowledge is your best tool for making informed decisions.</p>
                
                <h2>2. Location is Everything</h2>
                <p>The old adage "location, location, location" remains true. Look for areas with good infrastructure, transportation links, schools, and growth potential. A great property in a poor location is rarely a good investment.</p>
                
                <h2>3. Understand Your Financing Options</h2>
                <p>Explore different financing methods including traditional mortgages, developer financing, and fractional ownership platforms. Each has its own benefits and requirements.</p>
                
                <h2>4. Calculate All Costs</h2>
                <p>Don't just look at the purchase price. Factor in maintenance costs, property management fees, taxes, insurance, and potential vacancy periods when calculating your expected returns.</p>
                
                <h2>5. Start Small and Diversify</h2>
                <p>As a first-time investor, consider starting with smaller investments or fractional ownership to gain experience before committing larger amounts. Diversification across different properties and locations can help manage risk.</p>
                
                <h2>Bonus Tip: Work with Professionals</h2>
                <p>Partner with experienced real estate agents, lawyers, and financial advisors who understand the local market and can guide you through the process.</p>
                `,
                featuredImage: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?ixlib=rb-4.0.3&w=1000&q=80",
                images: [],
                category: BlogCategory.TIPS,
                tags: ["investment tips", "first time buyer", "real estate", "property investment", "beginner guide"],
                status: BlogStatus.PUBLISHED,
                authorId: adminUsers[2]._id,
                isFeatured: false,
                metaTitle: "5 Essential Tips for First-Time Property Investors",
                metaDescription: "Expert advice for first-time real estate investors covering market research, location selection, financing, and risk management.",
                keywords: ["first time property investment", "real estate tips", "property buying guide", "investment advice"]
            },
            {
                title: "Market Analysis: North Coast Property Trends 2024",
                slug: "market-analysis-north-coast-property-trends-2024",
                excerpt: "Comprehensive analysis of the North Coast real estate market, including price trends, new developments, and investment opportunities.",
                content: `
                <h2>Market Overview</h2>
                <p>The North Coast of Egypt continues to be one of the most attractive destinations for both local and international property investors. With its pristine beaches and year-round appeal, the region offers unique investment opportunities.</p>
                
                <h2>Price Trends</h2>
                <p>Property prices in the North Coast have shown steady growth over the past year, with beachfront properties leading the appreciation. Average prices have increased by 12-15% compared to 2023.</p>
                
                <h2>New Developments</h2>
                <p>Several major developers have launched new projects in 2024, including luxury resorts, residential compounds, and mixed-use developments. These projects are raising the bar for quality and amenities in the region.</p>
                
                <h2>Investment Hotspots</h2>
                <h3>Sidi Abdel Rahman</h3>
                <p>This area continues to attract premium developments with its crystal-clear waters and upscale positioning.</p>
                
                <h3>Ras El Hekma</h3>
                <p>The new Ras El Hekma project has created significant buzz and is expected to transform the western part of the North Coast.</p>
                
                <h2>Rental Market</h2>
                <p>The rental market remains strong, particularly during the summer season. Properties with direct beach access and premium amenities command the highest rental rates.</p>
                
                <h2>Future Outlook</h2>
                <p>With continued government investment in infrastructure and the growing popularity of the North Coast as a year-round destination, the market outlook remains positive for 2024 and beyond.</p>
                `,
                featuredImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&w=1000&q=80",
                images: [
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&w=1000&q=80"
                ],
                category: BlogCategory.MARKET_NEWS,
                tags: ["north coast", "market analysis", "property trends", "2024", "investment opportunities"],
                status: BlogStatus.PUBLISHED,
                authorId: adminUsers[0]._id,
                isFeatured: false,
                metaTitle: "North Coast Property Market Analysis 2024",
                metaDescription: "Detailed analysis of North Coast Egypt property trends, prices, new developments, and investment opportunities for 2024.",
                keywords: ["north coast egypt", "property market analysis", "real estate trends 2024", "beach property investment"]
            },
            {
                title: "Arkan Launches New Investment Platform Features",
                slug: "arkan-launches-new-investment-platform-features",
                excerpt: "Exciting new features on the Arkan platform make property investment even more accessible and user-friendly for investors.",
                content: `
                <h2>Enhanced User Experience</h2>
                <p>We're excited to announce the launch of several new features on the Arkan platform, designed to make property investment more accessible and transparent for our users.</p>
                
                <h2>New Features</h2>
                <h3>Advanced Property Analytics</h3>
                <p>Our new analytics dashboard provides detailed insights into property performance, market trends, and investment projections to help you make informed decisions.</p>
                
                <h3>Mobile App</h3>
                <p>The new Arkan mobile app allows you to manage your investments, track performance, and discover new opportunities on the go.</p>
                
                <h3>Automated Investment Plans</h3>
                <p>Set up recurring investments to gradually build your property portfolio over time with our new automated investment feature.</p>
                
                <h2>Improved Security</h2>
                <p>We've implemented additional security measures including two-factor authentication and enhanced encryption to protect your investments and personal information.</p>
                
                <h2>What's Next</h2>
                <p>We're continuously working to improve the platform based on user feedback. Upcoming features include social investing tools and expanded property categories.</p>
                
                <h2>Get Started Today</h2>
                <p>Existing users can access these new features immediately by logging into their accounts. New users can sign up and start exploring investment opportunities right away.</p>
                `,
                featuredImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&w=1000&q=80",
                images: [],
                category: BlogCategory.COMPANY_NEWS,
                tags: ["arkan", "platform update", "new features", "mobile app", "investment tools"],
                status: BlogStatus.PUBLISHED,
                authorId: adminUsers[1]._id,
                isFeatured: true,
                metaTitle: "Arkan Platform New Features Launch",
                metaDescription: "Discover the latest features on Arkan's investment platform including mobile app, analytics dashboard, and automated investing.",
                keywords: ["arkan platform", "investment app", "property investment tools", "real estate technology"]
            },
            {
                title: "Understanding Property Investment Returns and ROI",
                slug: "understanding-property-investment-returns-roi",
                excerpt: "A comprehensive guide to calculating and understanding different types of returns in real estate investment.",
                content: `
                <h2>Types of Property Investment Returns</h2>
                <p>Real estate investment can generate returns in several ways. Understanding these different types of returns is crucial for making informed investment decisions.</p>
                
                <h2>Rental Yield</h2>
                <p>Rental yield is the annual rental income expressed as a percentage of the property's value. It's calculated as: (Annual Rental Income / Property Value) × 100.</p>
                
                <h2>Capital Appreciation</h2>
                <p>This refers to the increase in property value over time. While not guaranteed, historical data shows that well-located properties tend to appreciate in value over the long term.</p>
                
                <h2>Total Return on Investment (ROI)</h2>
                <p>Total ROI combines both rental income and capital appreciation to give you a complete picture of your investment performance.</p>
                
                <h2>Factors Affecting Returns</h2>
                <h3>Location</h3>
                <p>Properties in prime locations typically offer better long-term returns due to higher demand and limited supply.</p>
                
                <h3>Property Type</h3>
                <p>Different property types (residential, commercial, mixed-use) offer varying risk-return profiles.</p>
                
                <h3>Market Conditions</h3>
                <p>Economic factors, interest rates, and government policies all impact property returns.</p>
                
                <h2>Calculating Your Returns</h2>
                <p>Use our online calculators to estimate potential returns based on different scenarios and investment amounts. Remember that past performance doesn't guarantee future results.</p>
                `,
                featuredImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&w=1000&q=80",
                images: [],
                category: BlogCategory.INVESTMENT,
                tags: ["ROI", "returns", "rental yield", "capital appreciation", "investment analysis"],
                status: BlogStatus.PUBLISHED,
                authorId: adminUsers[2]._id,
                isFeatured: false,
                metaTitle: "Property Investment Returns and ROI Guide",
                metaDescription: "Learn how to calculate and understand property investment returns including rental yield, capital appreciation, and total ROI.",
                keywords: ["property investment returns", "ROI calculation", "rental yield", "real estate analysis"]
            },
            {
                title: "Draft: Upcoming Market Trends for 2025",
                slug: "upcoming-market-trends-2025",
                excerpt: "Preview of expected real estate market trends and opportunities for the coming year.",
                content: `
                <h2>Emerging Trends</h2>
                <p>This is a draft post about upcoming market trends for 2025. Content will be finalized after market research completion.</p>
                
                <h2>Key Areas to Watch</h2>
                <p>- Technology integration in property management
                - Sustainable building practices
                - Changes in buyer preferences post-pandemic
                - Government policy impacts</p>
                
                <p>More detailed analysis coming soon...</p>
                `,
                featuredImage: "https://images.unsplash.com/photo-1460472178825-e5240623afd5?ixlib=rb-4.0.3&w=1000&q=80",
                images: [],
                category: BlogCategory.MARKET_NEWS,
                tags: ["2025 trends", "market forecast", "real estate", "predictions"],
                status: BlogStatus.DRAFT,
                authorId: adminUsers[0]._id,
                isFeatured: false,
                metaTitle: "Real Estate Market Trends 2025 Preview",
                metaDescription: "Preview of expected real estate market trends and investment opportunities for 2025.",
                keywords: ["real estate trends 2025", "market forecast", "property investment future"]
            }
        ];

        // Create blog posts
        const createdBlogs = [];
        for (const blogData of blogPosts) {
            const blog = new Blog(blogData);
            await blog.save();
            createdBlogs.push(blog);
            console.log(`Created blog: ${blog.title}`);
        }

        console.log("✅ Blog seeding completed successfully!");
        
        return {
            blogsCreated: createdBlogs.length,
            publishedBlogs: createdBlogs.filter(blog => blog.status === BlogStatus.PUBLISHED).length,
            draftBlogs: createdBlogs.filter(blog => blog.status === BlogStatus.DRAFT).length,
            featuredBlogs: createdBlogs.filter(blog => blog.isFeatured).length,
            categories: {
                realEstate: createdBlogs.filter(blog => blog.category === BlogCategory.REAL_ESTATE).length,
                investment: createdBlogs.filter(blog => blog.category === BlogCategory.INVESTMENT).length,
                tips: createdBlogs.filter(blog => blog.category === BlogCategory.TIPS).length,
                marketNews: createdBlogs.filter(blog => blog.category === BlogCategory.MARKET_NEWS).length,
                companyNews: createdBlogs.filter(blog => blog.category === BlogCategory.COMPANY_NEWS).length
            }
        };

    } catch (error) {
        console.error("❌ Error seeding blogs:", error);
        throw error;
    }
}
