import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Contact, ContactStatus, ContactCategory, ContactPriority } from "@/models/Contact";
import { withAuth } from "@/app/api/_utils/withAuth";
import { withApiKey } from "@/middleware/apiKey";
import { requireRole } from "@/middleware/authorize";
import { z } from "zod";

const querySchema = z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 50) : 20),
    status: z.enum([...Object.values(ContactStatus), 'all'] as [string, ...string[]]).optional().default('all'),
    category: z.enum(Object.values(ContactCategory) as [string, ...string[]]).optional(),
    priority: z.enum(Object.values(ContactPriority) as [string, ...string[]]).optional(),
    assignedTo: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'priority', 'status', 'responseTime']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Get all contacts (Admin)
export async function GET(request: NextRequest) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    const roleCheck = requireRole(request, ["admin"]);
    if (roleCheck) return roleCheck;

    try {
        await connectToDatabase();
        
        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        
        const {
            page,
            limit,
            status,
            category,
            priority,
            assignedTo,
            search,
            sortBy,
            sortOrder
        } = querySchema.parse(queryParams);

        // Build filter
        const filter: any = {};
        
        if (status !== 'all') filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;
        if (assignedTo) {
            if (assignedTo === 'unassigned') {
                filter.assignedTo = { $exists: false };
            } else {
                filter.assignedTo = assignedTo;
            }
        }
        
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort
        const sort: any = {};
        if (sortBy === 'priority') {
            // Custom priority sorting: urgent > high > medium > low
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            // This would need aggregation for proper sorting, for now use simple sort
            sort.priority = sortOrder === 'asc' ? 1 : -1;
        } else {
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        
        const [contacts, totalCount] = await Promise.all([
            Contact.find(filter)
                .populate('userId', 'firstName lastName email')
                .populate('assignedTo', 'firstName lastName')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .select('-internalNotes') // Exclude internal notes from listing
                .lean(),
            Contact.countDocuments(filter)
        ]);

        // Calculate pagination
        const totalPages = Math.ceil(totalCount / limit);

        // Get summary stats
        const stats = await Contact.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        return NextResponse.json({
            success: true,
            data: {
                contacts,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                stats: stats.reduce((acc, stat) => {
                    acc[stat._id] = stat.count;
                    return acc;
                }, {})
            }
        });

    } catch (error) {
        console.error("Error fetching contacts:", error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Invalid query parameters", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to fetch contacts" },
            { status: 500 }
        );
    }
}
