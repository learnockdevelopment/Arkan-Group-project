import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Investment, PaymentStatus } from "@/models/Investment";
import { withAuth } from "@/app/api/_utils/withAuth";
import { z } from "zod";

const paymentSchema = z.object({
    investmentId: z.string().min(1, "Investment ID is required"),
    installmentId: z.string().optional(),
    paymentType: z.enum(['down_payment', 'installment']),
    amount: z.number().min(0, "Amount must be positive"),
    transactionId: z.string().optional(),
    paymentMethod: z.string().optional(),
});

// GET - Get payment schedule for user's investments
export async function GET(request: NextRequest) {
    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    try {
        await connectToDatabase();
        
        const userId = (request as any).userId;
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // pending, overdue, upcoming
        const days = parseInt(searchParams.get('days') || '30');

        // Get user's active investments
        const investments = await Investment.find({
            userId,
            isActive: true,
            status: { $in: ['active', 'pending'] }
        }).populate('propertyId', 'name location image type');

        let paymentSchedule: any[] = [];

        for (const investment of investments) {
            // Add down payment if not paid
            if (!investment.downPaymentPaid) {
                paymentSchedule.push({
                    investmentId: investment._id,
                    propertyId: investment.propertyId,
                    type: 'down_payment',
                    amount: investment.downPayment,
                    dueDate: investment.investmentDate,
                    status: 'pending',
                    isOverdue: new Date() > investment.investmentDate
                });
            }

            // Add installments based on status filter
            investment.installments.forEach((installment: any) => {
                const isOverdue = installment.status === PaymentStatus.PENDING && 
                               installment.dueDate < new Date();
                
                const isUpcoming = installment.status === PaymentStatus.PENDING && 
                                 installment.dueDate >= new Date() && 
                                 installment.dueDate <= new Date(Date.now() + days * 24 * 60 * 60 * 1000);

                let includeInstallment = false;
                
                if (!status || status === 'all') {
                    includeInstallment = true;
                } else if (status === 'pending') {
                    includeInstallment = installment.status === PaymentStatus.PENDING;
                } else if (status === 'overdue') {
                    includeInstallment = isOverdue;
                } else if (status === 'upcoming') {
                    includeInstallment = isUpcoming;
                } else if (status === 'paid') {
                    includeInstallment = installment.status === PaymentStatus.PAID;
                }

                if (includeInstallment) {
                    paymentSchedule.push({
                        investmentId: investment._id,
                        installmentId: installment._id,
                        propertyId: investment.propertyId,
                        type: 'installment',
                        installmentNumber: installment.installmentNumber,
                        amount: installment.amount,
                        dueDate: installment.dueDate,
                        paidDate: installment.paidDate,
                        status: installment.status,
                        isOverdue,
                        isUpcoming
                    });
                }
            });
        }

        // Sort by due date
        paymentSchedule.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        return NextResponse.json({
            success: true,
            data: paymentSchedule
        });

    } catch (error) {
        console.error('Error fetching payment schedule:', error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch payment schedule" },
            { status: 500 }
        );
    }
}

// POST - Record a payment
export async function POST(request: NextRequest) {
    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    try {
        await connectToDatabase();
        
        const userId = (request as any).userId;
        const body = await request.json();
        const { 
            investmentId, 
            installmentId, 
            paymentType, 
            amount, 
            transactionId,
            paymentMethod 
        } = paymentSchema.parse(body);

        // Find investment and ensure it belongs to the user
        const investment = await Investment.findOne({
            _id: investmentId,
            userId,
            isActive: true
        });

        if (!investment) {
            return NextResponse.json(
                { success: false, message: "Investment not found" },
                { status: 404 }
            );
        }

        if (paymentType === 'down_payment') {
            // Validate down payment
            if (investment.downPaymentPaid) {
                return NextResponse.json(
                    { success: false, message: "Down payment already paid" },
                    { status: 400 }
                );
            }

            if (amount !== investment.downPayment) {
                return NextResponse.json(
                    { success: false, message: "Payment amount does not match down payment amount" },
                    { status: 400 }
                );
            }

            await investment.payDownPayment(transactionId);

        } else if (paymentType === 'installment') {
            // Validate installment payment
            if (!installmentId) {
                return NextResponse.json(
                    { success: false, message: "Installment ID is required for installment payments" },
                    { status: 400 }
                );
            }

            const installment = investment.installments.id(installmentId);
            if (!installment) {
                return NextResponse.json(
                    { success: false, message: "Installment not found" },
                    { status: 404 }
                );
            }

            if (installment.status === PaymentStatus.PAID) {
                return NextResponse.json(
                    { success: false, message: "Installment already paid" },
                    { status: 400 }
                );
            }

            if (amount !== installment.amount) {
                return NextResponse.json(
                    { success: false, message: "Payment amount does not match installment amount" },
                    { status: 400 }
                );
            }

            await investment.payInstallment(installmentId, transactionId);
        }

        // Populate property details for response
        await investment.populate('propertyId', 'name location image');

        return NextResponse.json({
            success: true,
            message: `${paymentType === 'down_payment' ? 'Down payment' : 'Installment'} recorded successfully`,
            data: {
                investment,
                paymentDetails: {
                    type: paymentType,
                    amount,
                    transactionId,
                    paymentMethod,
                    paidAt: new Date()
                }
            }
        });

    } catch (error) {
        console.error('Error recording payment:', error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Validation failed", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : "Failed to record payment" },
            { status: 500 }
        );
    }
}
