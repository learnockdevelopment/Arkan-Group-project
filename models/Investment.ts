import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

export enum InvestmentStatus {
    PENDING = "pending",
    ACTIVE = "active",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}

export enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    OVERDUE = "overdue",
    CANCELLED = "cancelled"
}

// Sub-schema for installment tracking
const installmentSchema = new Schema({
    installmentNumber: { type: Number, required: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    status: { 
        type: String, 
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING 
    },
    transactionId: { type: String }, // Reference to payment transaction
}, { _id: true });

const investmentSchema = new Schema(
    {
        // References
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: true,
            index: true 
        },
        propertyId: { 
            type: Schema.Types.ObjectId, 
            ref: "Property", 
            required: true,
            index: true 
        },
        
        // Investment Details
        sharesInvested: { type: Number, required: true, min: 1 },
        sharePrice: { type: Number, required: true, min: 0 }, // Price per share at time of investment
        totalInvestment: { type: Number, required: true, min: 0 }, // Total investment amount
        
        // Payment Structure
        downPayment: { type: Number, required: true, min: 0 },
        downPaymentPaid: { type: Boolean, default: false },
        downPaymentDate: { type: Date },
        downPaymentTransactionId: { type: String },
        
        // Installments
        installmentAmount: { type: Number, required: true, min: 0 },
        numberOfInstallments: { type: Number, required: true, min: 1 },
        installments: [installmentSchema],
        
        // Status
        status: { 
            type: String, 
            enum: Object.values(InvestmentStatus),
            default: InvestmentStatus.PENDING,
            index: true 
        },
        
        // Investment Timing
        investmentDate: { type: Date, default: Date.now },
        firstInstallmentDate: { type: Date }, // When installments should start
        completionDate: { type: Date }, // When all payments are completed
        
        // Returns and Profits
        expectedReturns: { type: Number, min: 0 },
        actualReturns: { type: Number, default: 0, min: 0 },
        profitDistributed: { type: Number, default: 0, min: 0 },
        
        // Metadata
        notes: { type: String },
        isActive: { type: Boolean, default: true, index: true },
        
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for better performance
investmentSchema.index({ userId: 1, propertyId: 1 });
investmentSchema.index({ status: 1, isActive: 1 });
investmentSchema.index({ investmentDate: -1 });
investmentSchema.index({ "installments.dueDate": 1, "installments.status": 1 });

// Compound index for user's active investments
investmentSchema.index({ userId: 1, status: 1, isActive: 1 });

// Virtual for total paid amount
investmentSchema.virtual('totalPaid').get(function() {
    let total = this.downPaymentPaid ? this.downPayment : 0;
    
    this.installments.forEach((installment: any) => {
        if (installment.status === PaymentStatus.PAID) {
            total += installment.amount;
        }
    });
    
    return total;
});

// Virtual for remaining amount
investmentSchema.virtual('remainingAmount').get(function() {
    return this.totalInvestment - this.totalPaid;
});

// Virtual for payment progress percentage
investmentSchema.virtual('paymentProgress').get(function() {
    return this.totalInvestment > 0 ? (this.totalPaid / this.totalInvestment) * 100 : 0;
});

// Virtual for next due installment
investmentSchema.virtual('nextDueInstallment').get(function() {
    return this.installments.find((installment: any) => 
        installment.status === PaymentStatus.PENDING && 
        installment.dueDate <= new Date()
    );
});

// Pre-save middleware to generate installments
investmentSchema.pre('save', function(next) {
    // Generate installments if this is a new investment and installments don't exist
    if (this.isNew && this.installments.length === 0) {
        this.generateInstallments();
    }
    
    // Update completion status
    this.updateCompletionStatus();
    
    next();
});

// Instance methods
investmentSchema.methods.generateInstallments = function() {
    const installments = [];
    const startDate = this.firstInstallmentDate || new Date();
    
    for (let i = 1; i <= this.numberOfInstallments; i++) {
        const dueDate = new Date(startDate);
        
        // Calculate due date based on installment frequency from property
        // For now, assuming monthly frequency - this should be fetched from property
        dueDate.setMonth(dueDate.getMonth() + (i - 1));
        
        installments.push({
            installmentNumber: i,
            amount: this.installmentAmount,
            dueDate: dueDate,
            status: PaymentStatus.PENDING
        });
    }
    
    this.installments = installments;
};

investmentSchema.methods.updateCompletionStatus = function() {
    const allInstallmentsPaid = this.installments.every((installment: any) => 
        installment.status === PaymentStatus.PAID
    );
    
    if (this.downPaymentPaid && allInstallmentsPaid) {
        this.status = InvestmentStatus.COMPLETED;
        this.completionDate = new Date();
    } else if (this.downPaymentPaid) {
        this.status = InvestmentStatus.ACTIVE;
    }
};

investmentSchema.methods.payDownPayment = function(transactionId?: string) {
    this.downPaymentPaid = true;
    this.downPaymentDate = new Date();
    this.downPaymentTransactionId = transactionId;
    this.status = InvestmentStatus.ACTIVE;
    
    return this.save();
};

investmentSchema.methods.payInstallment = function(installmentId: string, transactionId?: string) {
    const installment = this.installments.id(installmentId);
    
    if (!installment) {
        throw new Error("Installment not found");
    }
    
    if (installment.status === PaymentStatus.PAID) {
        throw new Error("Installment already paid");
    }
    
    installment.status = PaymentStatus.PAID;
    installment.paidDate = new Date();
    installment.transactionId = transactionId;
    
    this.updateCompletionStatus();
    
    return this.save();
};

investmentSchema.methods.getOverdueInstallments = function() {
    const now = new Date();
    return this.installments.filter((installment: any) => 
        installment.status === PaymentStatus.PENDING && 
        installment.dueDate < now
    );
};

investmentSchema.methods.getUpcomingInstallments = function(days: number = 30) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.installments.filter((installment: any) => 
        installment.status === PaymentStatus.PENDING && 
        installment.dueDate >= now && 
        installment.dueDate <= futureDate
    );
};

// Static methods
investmentSchema.statics.findByUser = function(userId: string) {
    return this.find({ userId, isActive: true }).populate('propertyId');
};

investmentSchema.statics.findByProperty = function(propertyId: string) {
    return this.find({ propertyId, isActive: true }).populate('userId');
};

investmentSchema.statics.findActiveInvestments = function() {
    return this.find({ 
        status: { $in: [InvestmentStatus.ACTIVE, InvestmentStatus.PENDING] },
        isActive: true 
    });
};

investmentSchema.statics.findOverduePayments = function() {
    const now = new Date();
    return this.find({
        "installments.status": PaymentStatus.PENDING,
        "installments.dueDate": { $lt: now },
        isActive: true
    });
};

export type InvestmentDocument = InferSchemaType<typeof investmentSchema> & {
    generateInstallments(): void;
    updateCompletionStatus(): void;
    payDownPayment(transactionId?: string): Promise<InvestmentDocument>;
    payInstallment(installmentId: string, transactionId?: string): Promise<InvestmentDocument>;
    getOverdueInstallments(): any[];
    getUpcomingInstallments(days?: number): any[];
    totalPaid: number;
    remainingAmount: number;
    paymentProgress: number;
    nextDueInstallment: any;
};

export const Investment: Model<InvestmentDocument> & {
    findByUser(userId: string): Promise<InvestmentDocument[]>;
    findByProperty(propertyId: string): Promise<InvestmentDocument[]>;
    findActiveInvestments(): Promise<InvestmentDocument[]>;
    findOverduePayments(): Promise<InvestmentDocument[]>;
} = (mongoose.models.Investment as any) || mongoose.model<InvestmentDocument>("Investment", investmentSchema);
