import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Contact, ContactStatus, ContactPriority } from "@/models/Contact";
import { withAuth } from "@/app/api/_utils/withAuth";
import { withApiKey } from "@/middleware/apiKey";
import { requireRole } from "@/middleware/authorize";
import { isValidObjectId } from "mongoose";
import { z } from "zod";

interface RouteParams {
    params: {
        id: string;
    };
}

const updateContactSchema = z.object({
    status: z.enum(Object.values(ContactStatus) as [string, ...string[]]).optional(),
    priority: z.enum(Object.values(ContactPriority) as [string, ...string[]]).optional(),
    assignedTo: z.string().optional(),
    adminResponse: z.string().optional(),
    internalNote: z.string().optional(),
    followUpRequired: z.boolean().optional(),
    followUpDate: z.string().transform(str => str ? new Date(str) : undefined).optional(),
});

// Get contact details (Admin)
export async function GET(request: NextRequest, { params }: RouteParams) {
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
        
        const { id } = params;
        
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid contact ID" },
                { status: 400 }
            );
        }

        // Find contact with full details
        const contact = await Contact.findById(id)
            .populate('userId', 'firstName lastName email phone')
            .populate('assignedTo', 'firstName lastName email')
            .populate('internalNotes.addedBy', 'firstName lastName');

        if (!contact) {
            return NextResponse.json(
                { success: false, message: "Contact not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: contact
        });

    } catch (error) {
        console.error("Error fetching contact:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch contact" },
            { status: 500 }
        );
    }
}

// Update contact (Admin)
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
        
        const { id } = params;
        const adminId = (request as any).userId;
        
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid contact ID" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const validatedData = updateContactSchema.parse(body);

        // Find contact
        const contact = await Contact.findById(id);
        if (!contact) {
            return NextResponse.json(
                { success: false, message: "Contact not found" },
                { status: 404 }
            );
        }

        // Handle different update actions
        if (validatedData.adminResponse) {
            await contact.addResponse(validatedData.adminResponse, adminId);
        }

        if (validatedData.internalNote) {
            await contact.addInternalNote(validatedData.internalNote, adminId);
        }

        // Update other fields
        const updateFields: any = {};
        if (validatedData.status) updateFields.status = validatedData.status;
        if (validatedData.priority) updateFields.priority = validatedData.priority;
        if (validatedData.assignedTo) updateFields.assignedTo = validatedData.assignedTo;
        if (validatedData.followUpRequired !== undefined) updateFields.followUpRequired = validatedData.followUpRequired;
        if (validatedData.followUpDate) updateFields.followUpDate = validatedData.followUpDate;

        // Apply updates
        Object.assign(contact, updateFields);
        await contact.save();

        // Populate for response
        await contact.populate('assignedTo', 'firstName lastName email');

        return NextResponse.json({
            success: true,
            message: "Contact updated successfully",
            data: contact
        });

    } catch (error) {
        console.error("Error updating contact:", error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Validation failed", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to update contact" },
            { status: 500 }
        );
    }
}

// Delete contact (Admin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
        
        const { id } = params;
        
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid contact ID" },
                { status: 400 }
            );
        }

        // Delete contact
        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return NextResponse.json(
                { success: false, message: "Contact not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Contact deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting contact:", error);
        return NextResponse.json(
            { success: false, message: "Failed to delete contact" },
            { status: 500 }
        );
    }
}
