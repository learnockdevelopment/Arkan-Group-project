import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { withAuth } from "@/app/api/_utils/withAuth";
import { withApiKey } from "@/middleware/apiKey";
import { validatePin } from "@/app/api/_utils/validators";
import { z } from "zod";

const changePinSchema = z.object({
    currentPin: z.string().min(6, "Current PIN must be 6 digits").max(6, "Current PIN must be 6 digits"),
    newPin: z.string().min(6, "New PIN must be 6 digits").max(6, "New PIN must be 6 digits"),
});

export async function POST(request: NextRequest) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    try {
        await connectToDatabase();
        
        const userId = (request as any).userId;
        const body = await request.json();
        
        const { currentPin, newPin } = changePinSchema.parse(body);

        // Validate new PIN format
        const pinValidation = validatePin(newPin);
        if (!pinValidation.isValid) {
            return NextResponse.json(
                { success: false, message: pinValidation.message },
                { status: 400 }
            );
        }

        // Find user with PIN hash
        const user = await User.findById(userId).select('+pinHash');
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Verify current PIN
        const isCurrentPinValid = await user.comparePin(currentPin);
        if (!isCurrentPinValid) {
            return NextResponse.json(
                { success: false, message: "Current PIN is incorrect" },
                { status: 400 }
            );
        }

        // Check if new PIN is different from current PIN
        const isSamePin = await user.comparePin(newPin);
        if (isSamePin) {
            return NextResponse.json(
                { success: false, message: "New PIN must be different from current PIN" },
                { status: 400 }
            );
        }

        // Set new PIN
        await user.setPin(newPin);
        await user.save();

        return NextResponse.json({
            success: true,
            message: "PIN changed successfully"
        });

    } catch (error) {
        console.error("Error changing PIN:", error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Validation failed", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to change PIN" },
            { status: 500 }
        );
    }
}
