import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const propertyViewSchema = new Schema(
    {
        propertyId: { 
            type: Schema.Types.ObjectId, 
            ref: "Property", 
            required: true,
            index: true 
        },
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: "User",
            index: true 
        }, // null for anonymous views
        
        // View Details
        ipAddress: { type: String },
        userAgent: { type: String },
        referrer: { type: String },
        
        // Session tracking
        sessionId: { type: String, index: true },
        viewDuration: { type: Number, default: 0 }, // in seconds
        
        // Geographic data
        country: { type: String },
        city: { type: String },
        
        // Metadata
        viewDate: { type: Date, default: Date.now, index: true },
        
    },
    { 
        timestamps: false // We use viewDate instead
    }
);

// Indexes for analytics
propertyViewSchema.index({ propertyId: 1, viewDate: -1 });
propertyViewSchema.index({ userId: 1, viewDate: -1 });
propertyViewSchema.index({ viewDate: -1 });

// Static methods for analytics
propertyViewSchema.statics.getPropertyViews = function(propertyId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.countDocuments({
        propertyId,
        viewDate: { $gte: startDate }
    });
};

propertyViewSchema.statics.getTopViewedProperties = function(limit: number = 10, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.aggregate([
        {
            $match: {
                viewDate: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: "$propertyId",
                viewCount: { $sum: 1 },
                uniqueUsers: { $addToSet: "$userId" }
            }
        },
        {
            $addFields: {
                uniqueUserCount: { $size: "$uniqueUsers" }
            }
        },
        {
            $sort: { viewCount: -1 }
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: "properties",
                localField: "_id",
                foreignField: "_id",
                as: "property"
            }
        }
    ]);
};

propertyViewSchema.statics.getUserViewHistory = function(userId: string, limit: number = 20) {
    return this.find({ userId })
        .populate('propertyId')
        .sort({ viewDate: -1 })
        .limit(limit);
};

export type PropertyViewDocument = InferSchemaType<typeof propertyViewSchema>;

export const PropertyView: Model<PropertyViewDocument> & {
    getPropertyViews(propertyId: string, days?: number): Promise<number>;
    getTopViewedProperties(limit?: number, days?: number): Promise<any[]>;
    getUserViewHistory(userId: string, limit?: number): Promise<PropertyViewDocument[]>;
} = (mongoose.models.PropertyView as any) || mongoose.model<PropertyViewDocument>("PropertyView", propertyViewSchema);
