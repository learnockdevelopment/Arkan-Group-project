import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Contact, ContactCategory } from "@/models/Contact";
import { withApiKey } from "@/middleware/apiKey";
import { z } from "zod";

const contactSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    subject: z.string().min(1, "Subject is required").max(200),
    message: z.string().min(10, "Message must be at least 10 characters").max(2000),
    category: z.enum(Object.values(ContactCategory) as [string, ...string[]]).optional().default(ContactCategory.GENERAL_INQUIRY),
});

// Submit contact form (Public)
export async function POST(request: NextRequest) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

    try {
        await connectToDatabase();
        
        const body = await request.json();
        const validatedData = contactSchema.parse(body);

        // Get request metadata
        const ipAddress = request.headers.get('x-forwarded-for') || 
                         request.headers.get('x-real-ip') || 
                         'unknown';
        const userAgent = request.headers.get('user-agent') || '';
        const referrer = request.headers.get('referer') || '';

        // Check if user is authenticated (optional)
        let userId = null;
        const authHeader = request.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const { withAuth } = await import('@/app/api/_utils/withAuth');
                const authResult = await withAuth(request);
                if (!authResult.error) {
                    userId = (request as any).userId;
                }
            } catch (error) {
                // User not authenticated, continue as anonymous
            }
        }

        // Create contact record
        const contact = new Contact({
            ...validatedData,
            userId,
            ipAddress,
            userAgent,
            referrer
        });

        await contact.save();

        // TODO: Send notification email to admin
        // TODO: Send confirmation email to user

        return NextResponse.json({
            success: true,
            message: "Your message has been sent successfully. We'll get back to you soon!",
            data: {
                contactId: contact._id,
                submittedAt: contact.createdAt
            }
        }, { status: 201 });

    } catch (error) {
        console.error("Error submitting contact form:", error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Validation failed", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to submit contact form" },
            { status: 500 }
        );
    }
}
