import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Property, PropertyType, PropertyStatus } from "@/models/Property";
import { User } from "@/models/User";
import { requireRole } from "@/middleware/authorize";
import { withAuth } from "@/app/api/_utils/withAuth";
import { z } from "zod";

const propertySchema = z.object({
    name: z.string().min(1, "Property name is required").max(200),
    type: z.enum([PropertyType.SINGLE, PropertyType.PROJECT, PropertyType.BUNDLE]),
    location: z.string().min(1, "Location is required"),
    image: z.string().url("Invalid image URL"),
    images: z.array(z.string().url()).optional().default([]),
    landSize: z.string().optional(),
    license: z.string().optional(),
    about: z.string().min(10, "About section must be at least 10 characters"),
    offers: z.array(z.string()).optional().default([]),
    keyHighlights: z.array(z.object({
        label: z.string().min(1),
        value: z.string().min(1)
    })).max(5, "Maximum 5 key highlights allowed").optional().default([]),
    reasonsToInvest: z.array(z.object({
        title: z.string().min(1),
        desc: z.string().min(1)
    })).max(3, "Maximum 3 reasons to invest allowed").optional().default([]),
    price: z.number().min(0, "Price must be positive"),
    priceType: z.string().optional().default("EGP"),
    roi: z.number().min(0).max(100).optional(),
    advancement: z.number().min(0).max(100, "Advancement must be between 0-100%"),
    totalShares: z.number().min(1, "Total shares must be at least 1"),
    maxSharesPerUser: z.number().min(1).optional(),
    numberOfInstallments: z.number().min(1, "Number of installments must be at least 1"),
    installmentsFrequency: z.enum(['monthly', 'quarterly', 'semi_annual', 'annual']).optional().default('monthly'),
    rooms: z.number().min(0).optional(),
    bathrooms: z.number().min(0).optional(),
    coordinates: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180)
    }).optional(),
    deliveryDate: z.string().transform(str => new Date(str)),
    deliveryStatus: z.enum(Object.values(PropertyStatus) as [string, ...string[]]).optional().default(PropertyStatus.UNDER_CONSTRUCTION),
    documents: z.array(z.object({
        title: z.string().min(1),
        url: z.string().url()
    })).optional().default([]),
    bundleProperties: z.array(z.string()).optional(),
    projectValue: z.number().min(0).optional(),
    expectedReturns: z.number().min(0).optional(),
});

const querySchema = z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 50) : 20),
    type: z.enum([PropertyType.SINGLE, PropertyType.PROJECT, PropertyType.BUNDLE]).optional(),
    status: z.enum(Object.values(PropertyStatus) as [string, ...string[]]).optional(),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'name', 'price', 'status', 'deliveryDate']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// GET - List owner's properties
export async function GET(request: NextRequest) {
    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    const roleCheck = requireRole(request, ["owner", "admin"]);
    if (roleCheck) return roleCheck;

    try {
        await connectToDatabase();
        
        const userId = (request as any).userId;
        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        
        const {
            page,
            limit,
            type,
            status,
            search,
            sortBy,
            sortOrder
        } = querySchema.parse(queryParams);

        // Build filter - owner can only see their own properties
        const filter: any = { 
            developerId: userId,
            isActive: true 
        };
        
        if (type) filter.type = type;
        if (status) filter.status = status;
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query
        const skip = (page - 1) * limit;
        
        const [properties, totalCount] = await Promise.all([
            Property.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Property.countDocuments(filter)
        ]);

        // Calculate pagination
        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            success: true,
            data: {
                properties,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error fetching owner properties:', error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Invalid query parameters", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to fetch properties" },
            { status: 500 }
        );
    }
}

// POST - Create new property (Owner)
export async function POST(request: NextRequest) {
    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    const roleCheck = requireRole(request, ["owner", "admin"]);
    if (roleCheck) return roleCheck;

    try {
        await connectToDatabase();
        
        const userId = (request as any).userId;
        const body = await request.json();
        const validatedData = propertySchema.parse(body);

        // Verify user has owner or admin role
        const user = await User.findById(userId).populate('roleId');
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const roleName = (user.roleId as any)?.name;
        if (!['admin', 'owner'].includes(roleName)) {
            return NextResponse.json(
                { success: false, message: "Insufficient permissions" },
                { status: 403 }
            );
        }

        // For bundle type, validate bundle properties belong to the same owner
        if (validatedData.type === PropertyType.BUNDLE && validatedData.bundleProperties) {
            const bundleProps = await Property.find({
                _id: { $in: validatedData.bundleProperties },
                type: PropertyType.SINGLE,
                developerId: userId,
                isActive: true
            });
            
            if (bundleProps.length !== validatedData.bundleProperties.length) {
                return NextResponse.json(
                    { success: false, message: "Some bundle properties not found or not owned by you" },
                    { status: 400 }
                );
            }
        }

        // Create property with owner as developer
        const propertyData = {
            ...validatedData,
            developerId: userId,
            status: PropertyStatus.AVAILABLE
        };

        const property = new Property(propertyData);
        await property.save();

        return NextResponse.json({
            success: true,
            message: "Property created successfully",
            data: property
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating property:', error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Validation failed", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to create property" },
            { status: 500 }
        );
    }
}
