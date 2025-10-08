import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Property, PropertyType, PropertyStatus } from "@/models/Property";
import { PropertyView } from "@/models/PropertyView";
import { withApiKey } from "@/middleware/apiKey";
import { z } from "zod";

// Validation schema for query parameters
const querySchema = z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 50) : 12),
    type: z.enum([PropertyType.SINGLE, PropertyType.PROJECT, PropertyType.BUNDLE]).optional(),
    status: z.enum(Object.values(PropertyStatus) as [string, ...string[]]).optional(),
    location: z.string().optional(),
    minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    minRoi: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    maxRoi: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    rooms: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    bathrooms: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    featured: z.string().optional().transform(val => val === 'true'),
    available: z.string().optional().transform(val => val === 'true'),
    sortBy: z.enum(['createdAt', 'price', 'roi', 'deliveryDate', 'viewCount']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().optional(),
});

export async function GET(request: NextRequest) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

    try {
        await connectToDatabase();
        
        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        
        // Validate query parameters
        const {
            page,
            limit,
            type,
            status,
            location,
            minPrice,
            maxPrice,
            minRoi,
            maxRoi,
            rooms,
            bathrooms,
            featured,
            available,
            sortBy,
            sortOrder,
            search
        } = querySchema.parse(queryParams);

        // Build filter query
        const filter: any = { isActive: true };

        if (type) filter.type = type;
        if (status) filter.status = status;
        if (location) filter.location = { $regex: location, $options: 'i' };
        if (featured) filter.isFeatured = true;
        if (available) {
            filter.status = PropertyStatus.AVAILABLE;
            filter.availableShares = { $gt: 0 };
        }

        // Price range filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined) filter.price.$gte = minPrice;
            if (maxPrice !== undefined) filter.price.$lte = maxPrice;
        }

        // ROI range filter
        if (minRoi !== undefined || maxRoi !== undefined) {
            filter.roi = {};
            if (minRoi !== undefined) filter.roi.$gte = minRoi;
            if (maxRoi !== undefined) filter.roi.$lte = maxRoi;
        }

        // Property details filter
        if (rooms !== undefined) filter.rooms = rooms;
        if (bathrooms !== undefined) filter.bathrooms = bathrooms;

        // Search filter
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { about: { $regex: search, $options: 'i' } },
                { offers: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Build sort query
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const skip = (page - 1) * limit;
        
        const [properties, totalCount] = await Promise.all([
            Property.find(filter)
                .populate('developerId', 'firstName lastName email phone avatarUrl')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Property.countDocuments(filter)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return NextResponse.json({
            success: true,
            data: {
                properties,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    limit,
                    hasNextPage,
                    hasPrevPage
                }
            }
        });

    } catch (error) {
        console.error('Error fetching properties:', error);
        
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
