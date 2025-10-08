import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

// Enums for property types and statuses
export enum PropertyType {
    SINGLE = "single",
    PROJECT = "project", 
    BUNDLE = "bundle"
}

export enum PropertyStatus {
    AVAILABLE = "Available",
    FUNDED = "Funded", 
    EXITED = "Exited",
    UNDER_CONSTRUCTION = "Under Construction",
    COMPLETED = "Completed"
}

export enum InstallmentFrequency {
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    SEMI_ANNUAL = "semi_annual",
    ANNUAL = "annual"
}

// Sub-schemas
const keyHighlightSchema = new Schema({
    label: { type: String, required: true },
    value: { type: String, required: true }
}, { _id: false });

const reasonToInvestSchema = new Schema({
    title: { type: String, required: true },
    desc: { type: String, required: true }
}, { _id: false });

const coordinatesSchema = new Schema({
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
}, { _id: false });

const documentSchema = new Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

// Main Property Schema
const propertySchema = new Schema(
    {
        name: { type: String, required: true, trim: true, index: true },
        type: { 
            type: String, 
            enum: Object.values(PropertyType), 
            required: true,
            index: true 
        },
        
        // Developer/Owner reference
        developerId: { 
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: true,
            index: true 
        },
        
        // Basic Information
        location: { type: String, required: true },
        image: { type: String, required: true },
        images: [{ type: String }],
        landSize: { type: String },
        license: { type: String },
        about: { type: String, required: true },
        offers: [{ type: String }],
        
        // Status and Highlights
        status: { 
            type: String, 
            enum: Object.values(PropertyStatus), 
            default: PropertyStatus.AVAILABLE,
            index: true 
        },
        keyHighlights: {
            type: [keyHighlightSchema],
            validate: [arrayLimit(5), 'Key highlights cannot exceed 5 items']
        },
        reasonsToInvest: {
            type: [reasonToInvestSchema],
            validate: [arrayLimit(3), 'Reasons to invest cannot exceed 3 items']
        },
        
        // Financial Information
        price: { type: Number, required: true, min: 0 },
        priceType: { type: String, default: "EGP" },
        roi: { type: Number, min: 0, max: 100 }, // Return on Investment percentage
        advancement: { type: Number, required: true, min: 0, max: 100 }, // Down payment percentage
        
        // Share Information
        totalShares: { type: Number, required: true, min: 1 },
        availableShares: { type: Number, min: 0, default: 0 }, // Calculated field
        sharePrice: { type: Number, min: 0, default: 0 }, // Calculated field
        shareDownPayment: { type: Number, min: 0, default: 0 }, // Calculated field
        shareInstallment: { type: Number, min: 0, default: 0 }, // Calculated field
        maxSharesPerUser: { type: Number, min: 1 }, // Only for single properties, null for projects
        
        // Installment Information
        numberOfInstallments: { type: Number, required: true, min: 1 },
        installmentsFrequency: { 
            type: String, 
            enum: Object.values(InstallmentFrequency),
            default: InstallmentFrequency.MONTHLY 
        },
        
        // Property Details (for single properties and projects)
        rooms: { type: Number, min: 0 },
        bathrooms: { type: Number, min: 0 },
        coordinates: coordinatesSchema,
        
        // Delivery Information
        deliveryDate: { type: Date, required: true },
        deliveryStatus: { 
            type: String, 
            enum: Object.values(PropertyStatus),
            default: PropertyStatus.UNDER_CONSTRUCTION 
        },
        
        // Documents
        documents: [documentSchema],
        
        // Bundle-specific fields
        bundleProperties: [{ 
            type: Schema.Types.ObjectId, 
            ref: "Property" 
        }], // Only for bundle type
        bundleSize: { type: Number, min: 0 }, // Number of properties in bundle
        
        // Project-specific fields
        projectValue: { type: Number, min: 0 }, // Total project value
        expectedReturns: { type: Number, min: 0 }, // Expected returns
        
        // Investment tracking
        totalInvested: { type: Number, default: 0, min: 0 },
        investmentStartDate: { type: Date }, // When first investment was made
        lastInvestmentDate: { type: Date }, // When last investment was made
        
        // Metadata
        isActive: { type: Boolean, default: true, index: true },
        isFeatured: { type: Boolean, default: false, index: true },
        viewCount: { type: Number, default: 0, min: 0 },
        
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Helper function for array validation
function arrayLimit(val: number) {
    return function(arr: any[]) {
        return arr.length <= val;
    };
}

// Indexes for better performance
propertySchema.index({ type: 1, status: 1 });
propertySchema.index({ developerId: 1, isActive: 1 });
propertySchema.index({ location: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ deliveryDate: 1 });
propertySchema.index({ createdAt: -1 });
propertySchema.index({ isFeatured: 1, isActive: 1 });

// Virtual for calculating funding percentage
propertySchema.virtual('fundingPercentage').get(function() {
    const totalValue = this.totalShares * this.sharePrice;
    return totalValue > 0 ? (this.totalInvested / totalValue) * 100 : 0;
});

// Virtual for remaining shares
propertySchema.virtual('remainingShares').get(function() {
    return this.totalShares - (this.totalShares - this.availableShares);
});

// Pre-save middleware to calculate share prices
propertySchema.pre('save', function(next) {
    // Always calculate share price
    if (this.price && this.totalShares) {
        this.sharePrice = Math.round(this.price / this.totalShares);
    }
    
    // Always calculate down payment per share
    if (this.sharePrice && this.advancement !== undefined) {
        this.shareDownPayment = Math.round((this.sharePrice * this.advancement) / 100);
    }
    
    // Always calculate installment per share
    if (this.sharePrice && this.shareDownPayment !== undefined && this.numberOfInstallments) {
        const remainingAmount = this.sharePrice - this.shareDownPayment;
        this.shareInstallment = Math.round(remainingAmount / this.numberOfInstallments);
    }
    
    // Always set available shares to total shares if not set or is new document
    if (this.isNew || this.availableShares === undefined || this.availableShares === 0) {
        this.availableShares = this.totalShares;
    }
    
    // For projects, remove max shares per user limit
    if (this.type === PropertyType.PROJECT) {
        this.maxSharesPerUser = undefined;
    }
    
    // For bundles, ensure bundle-specific fields are set
    if (this.type === PropertyType.BUNDLE && this.bundleProperties) {
        this.bundleSize = this.bundleProperties.length;
    }
    
    next();
});

// Static methods
propertySchema.statics.findByType = function(type: PropertyType) {
    return this.find({ type, isActive: true });
};

propertySchema.statics.findByDeveloper = function(developerId: string) {
    return this.find({ developerId, isActive: true });
};

propertySchema.statics.findAvailable = function() {
    return this.find({ 
        status: PropertyStatus.AVAILABLE, 
        isActive: true,
        availableShares: { $gt: 0 }
    });
};

propertySchema.statics.findFeatured = function() {
    return this.find({ 
        isFeatured: true, 
        isActive: true 
    }).sort({ createdAt: -1 });
};

// Instance methods
propertySchema.methods.canInvest = function(shares: number, userId?: string) {
    // Check if property is available for investment
    if (this.status !== PropertyStatus.AVAILABLE || !this.isActive) {
        return { canInvest: false, reason: "Property not available for investment" };
    }
    
    // Check if enough shares available
    if (shares > this.availableShares) {
        return { canInvest: false, reason: "Not enough shares available" };
    }
    
    // For single properties, check max shares per user limit
    if (this.type === PropertyType.SINGLE && this.maxSharesPerUser && shares > this.maxSharesPerUser) {
        return { canInvest: false, reason: `Maximum ${this.maxSharesPerUser} shares per user` };
    }
    
    return { canInvest: true };
};

propertySchema.methods.reserveShares = function(shares: number) {
    if (shares > this.availableShares) {
        throw new Error("Not enough shares available");
    }
    
    this.availableShares -= shares;
    this.totalInvested += (shares * this.sharePrice);
    
    if (!this.investmentStartDate) {
        this.investmentStartDate = new Date();
    }
    this.lastInvestmentDate = new Date();
    
    // Update status if fully funded
    if (this.availableShares === 0) {
        this.status = PropertyStatus.FUNDED;
    }
    
    return this.save();
};

export type PropertyDocument = InferSchemaType<typeof propertySchema> & {
    canInvest(shares: number, userId?: string): { canInvest: boolean; reason?: string };
    reserveShares(shares: number): Promise<PropertyDocument>;
    fundingPercentage: number;
    remainingShares: number;
};

export const Property: Model<PropertyDocument> & {
    findByType(type: PropertyType): Promise<PropertyDocument[]>;
    findByDeveloper(developerId: string): Promise<PropertyDocument[]>;
    findAvailable(): Promise<PropertyDocument[]>;
    findFeatured(): Promise<PropertyDocument[]>;
} = (mongoose.models.Property as any) || mongoose.model<PropertyDocument>("Property", propertySchema);
