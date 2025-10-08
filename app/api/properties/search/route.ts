import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Property, PropertyType, PropertyStatus } from "@/models/Property";
import { withApiKey } from "@/middleware/apiKey";
import { z } from "zod";

const searchSchema = z.object({
    q: z.string().min(1, "Search query is required"),
    limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 20) : 10),
    type: z.enum([PropertyType.SINGLE, PropertyType.PROJECT, PropertyType.BUNDLE]).optional(),
    location: z.string().optional(),
});

export async function GET(request: NextRequest) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

    try {
        await connectToDatabase();
        
        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        
        const { q, limit, type, location } = searchSchema.parse(queryParams);

        // Build search filter
        const filter: any = { 
            isActive: true,
            status: PropertyStatus.AVAILABLE
        };

        if (type) filter.type = type;
        if (location) filter.location = { $regex: location, $options: 'i' };

        // Create text search conditions
        const searchConditions = [
            { name: { $regex: q, $options: 'i' } },
            { location: { $regex: q, $options: 'i' } },
            { about: { $regex: q, $options: 'i' } },
            { offers: { $in: [new RegExp(q, 'i')] } },
            { 'keyHighlights.label': { $regex: q, $options: 'i' } },
            { 'keyHighlights.value': { $regex: q, $options: 'i' } },
            { 'reasonsToInvest.title': { $regex: q, $options: 'i' } },
            { 'reasonsToInvest.desc': { $regex: q, $options: 'i' } }
        ];

        filter.$or = searchConditions;

        // Execute search
        const properties = await Property.find(filter)
            .populate('developerId', 'firstName lastName avatarUrl')
            .sort({ 
                // Prioritize exact matches in name
                name: 1,
                createdAt: -1 
            })
            .limit(limit)
            .lean();

        // Get search suggestions (for autocomplete)
        const suggestions = await Property.aggregate([
            {
                $match: {
                    isActive: true,
                    $or: [
                        { name: { $regex: q, $options: 'i' } },
                        { location: { $regex: q, $options: 'i' } }
                    ]
                }
            },
            {
                $project: {
                    name: 1,
                    location: 1,
                    type: 1
                }
            },
            {
                $limit: 5
            }
        ]);

        return NextResponse.json({
            success: true,
            data: {
                properties,
                suggestions,
                query: q,
                totalResults: properties.length
            }
        });

    } catch (error) {
        console.error('Error searching properties:', error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Invalid search parameters", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to search properties" },
            { status: 500 }
        );
    }
}
