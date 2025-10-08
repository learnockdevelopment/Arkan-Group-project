import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const cardSchema = new Schema(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: true,
            index: true 
        },
        
        // Card Information
        cardNumber: { type: String, required: true }, // Encrypted/tokenized
        cardHolderName: { type: String, required: true, trim: true },
        expiryMonth: { type: Number, required: true, min: 1, max: 12 },
        expiryYear: { type: Number, required: true },
        cardType: { 
            type: String, 
            enum: ['visa', 'mastercard', 'amex', 'discover'], 
            required: true 
        },
        
        // Display Information (for UI)
        lastFourDigits: { type: String, required: true, length: 4 },
        cardBrand: { type: String }, // e.g., "Visa", "Mastercard"
        
        // Status and Settings
        isDefault: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true, index: true },
        
        // Security
        fingerprint: { type: String, unique: true }, // Unique card identifier
        
        // Metadata
        nickname: { type: String, trim: true }, // User-defined card name
        billingAddress: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            zipCode: { type: String },
            country: { type: String, default: 'EG' }
        },
        
        // Usage tracking
        lastUsedAt: { type: Date },
        usageCount: { type: Number, default: 0 },
        
    },
    { 
        timestamps: true,
        toJSON: { 
            virtuals: true,
            transform: function(doc, ret) {
                // Never return full card number in JSON
                delete ret.cardNumber;
                return ret;
            }
        },
        toObject: { virtuals: true }
    }
);

// Indexes
cardSchema.index({ userId: 1, isActive: 1 });
cardSchema.index({ userId: 1, isDefault: 1 });
cardSchema.index({ fingerprint: 1 }, { unique: true });

// Virtual for masked card number
cardSchema.virtual('maskedCardNumber').get(function() {
    return `**** **** **** ${this.lastFourDigits}`;
});

// Virtual for expiry date string
cardSchema.virtual('expiryDate').get(function() {
    return `${this.expiryMonth.toString().padStart(2, '0')}/${this.expiryYear.toString().slice(-2)}`;
});

// Virtual for checking if card is expired
cardSchema.virtual('isExpired').get(function() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    return this.expiryYear < currentYear || 
           (this.expiryYear === currentYear && this.expiryMonth < currentMonth);
});

// Pre-save middleware
cardSchema.pre('save', async function(next) {
    // If this card is being set as default, unset other default cards for this user
    if (this.isDefault && this.isModified('isDefault')) {
        await this.constructor.updateMany(
            { userId: this.userId, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    
    // Generate fingerprint if not exists (in real app, this would be based on tokenized card data)
    if (!this.fingerprint) {
        this.fingerprint = `${this.userId}_${this.lastFourDigits}_${this.expiryMonth}_${this.expiryYear}`;
    }
    
    next();
});

// Static methods
cardSchema.statics.findUserCards = function(userId: string, activeOnly: boolean = true) {
    const filter: any = { userId };
    if (activeOnly) {
        filter.isActive = true;
    }
    return this.find(filter).sort({ isDefault: -1, createdAt: -1 });
};

cardSchema.statics.findDefaultCard = function(userId: string) {
    return this.findOne({ userId, isDefault: true, isActive: true });
};

cardSchema.statics.setDefaultCard = async function(userId: string, cardId: string) {
    // Unset all default cards for user
    await this.updateMany(
        { userId },
        { isDefault: false }
    );
    
    // Set new default card
    return this.findByIdAndUpdate(
        cardId,
        { isDefault: true },
        { new: true }
    );
};

// Instance methods
cardSchema.methods.markAsUsed = function() {
    this.lastUsedAt = new Date();
    this.usageCount += 1;
    return this.save();
};

cardSchema.methods.deactivate = function() {
    this.isActive = false;
    if (this.isDefault) {
        this.isDefault = false;
    }
    return this.save();
};

export type CardDocument = InferSchemaType<typeof cardSchema> & {
    markAsUsed(): Promise<CardDocument>;
    deactivate(): Promise<CardDocument>;
    maskedCardNumber: string;
    expiryDate: string;
    isExpired: boolean;
};

export const Card: Model<CardDocument> & {
    findUserCards(userId: string, activeOnly?: boolean): Promise<CardDocument[]>;
    findDefaultCard(userId: string): Promise<CardDocument | null>;
    setDefaultCard(userId: string, cardId: string): Promise<CardDocument | null>;
} = (mongoose.models.Card as any) || mongoose.model<CardDocument>("Card", cardSchema);
