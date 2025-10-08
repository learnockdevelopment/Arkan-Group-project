import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

export enum ContactStatus {
    NEW = "new",
    IN_PROGRESS = "in_progress", 
    RESOLVED = "resolved",
    CLOSED = "closed"
}

export enum ContactPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}

export enum ContactCategory {
    GENERAL_INQUIRY = "general_inquiry",
    TECHNICAL_SUPPORT = "technical_support",
    INVESTMENT_QUESTION = "investment_question",
    ACCOUNT_ISSUE = "account_issue",
    PROPERTY_INQUIRY = "property_inquiry",
    COMPLAINT = "complaint",
    SUGGESTION = "suggestion",
    PARTNERSHIP = "partnership",
    OTHER = "other"
}

const contactSchema = new Schema(
    {
        // Contact Information
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, index: true },
        phone: { type: String, required: true },
        
        // User reference (if logged in user)
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: "User",
            index: true 
        },
        
        // Message Details
        subject: { type: String, required: true, trim: true, maxlength: 200 },
        message: { type: String, required: true, maxlength: 2000 },
        category: { 
            type: String, 
            enum: Object.values(ContactCategory),
            default: ContactCategory.GENERAL_INQUIRY,
            index: true 
        },
        
        // Status and Priority
        status: { 
            type: String, 
            enum: Object.values(ContactStatus),
            default: ContactStatus.NEW,
            index: true 
        },
        priority: { 
            type: String, 
            enum: Object.values(ContactPriority),
            default: ContactPriority.MEDIUM,
            index: true 
        },
        
        // Admin Management
        assignedTo: { 
            type: Schema.Types.ObjectId, 
            ref: "User",
            index: true 
        }, // Admin user assigned to handle this
        
        // Response and Resolution
        adminResponse: { type: String },
        responseDate: { type: Date },
        resolvedDate: { type: Date },
        closedDate: { type: Date },
        
        // Additional Information
        ipAddress: { type: String },
        userAgent: { type: String },
        referrer: { type: String },
        
        // Attachments (if any)
        attachments: [{
            filename: { type: String, required: true },
            url: { type: String, required: true },
            fileSize: { type: Number },
            mimeType: { type: String }
        }],
        
        // Internal Notes (admin only)
        internalNotes: [{
            note: { type: String, required: true },
            addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
            addedAt: { type: Date, default: Date.now }
        }],
        
        // Follow-up
        followUpRequired: { type: Boolean, default: false },
        followUpDate: { type: Date },
        
        // Rating (if user provides feedback)
        satisfactionRating: { type: Number, min: 1, max: 5 },
        feedback: { type: String },
        
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for better performance
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ category: 1, status: 1 });
contactSchema.index({ assignedTo: 1, status: 1 });
contactSchema.index({ priority: 1, status: 1 });
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ createdAt: -1 });

// Text search index
contactSchema.index({ 
    subject: 'text', 
    message: 'text',
    firstName: 'text',
    lastName: 'text'
});

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for response time (in hours)
contactSchema.virtual('responseTime').get(function() {
    if (!this.responseDate) return null;
    
    const diffMs = this.responseDate.getTime() - this.createdAt.getTime();
    return Math.round(diffMs / (1000 * 60 * 60)); // Convert to hours
});

// Virtual for resolution time (in hours)
contactSchema.virtual('resolutionTime').get(function() {
    if (!this.resolvedDate) return null;
    
    const diffMs = this.resolvedDate.getTime() - this.createdAt.getTime();
    return Math.round(diffMs / (1000 * 60 * 60)); // Convert to hours
});

// Pre-save middleware
contactSchema.pre('save', function(next) {
    // Set response date when admin response is added
    if (this.adminResponse && !this.responseDate) {
        this.responseDate = new Date();
    }
    
    // Set resolved date when status changes to resolved
    if (this.status === ContactStatus.RESOLVED && !this.resolvedDate) {
        this.resolvedDate = new Date();
    }
    
    // Set closed date when status changes to closed
    if (this.status === ContactStatus.CLOSED && !this.closedDate) {
        this.closedDate = new Date();
    }
    
    next();
});

// Static methods
contactSchema.statics.findByStatus = function(status: ContactStatus) {
    return this.find({ status }).sort({ createdAt: -1 });
};

contactSchema.statics.findByCategory = function(category: ContactCategory) {
    return this.find({ category }).sort({ createdAt: -1 });
};

contactSchema.statics.findByPriority = function(priority: ContactPriority) {
    return this.find({ priority }).sort({ createdAt: -1 });
};

contactSchema.statics.findAssignedTo = function(adminId: string) {
    return this.find({ assignedTo: adminId }).sort({ createdAt: -1 });
};

contactSchema.statics.findUnassigned = function() {
    return this.find({ 
        assignedTo: { $exists: false },
        status: { $in: [ContactStatus.NEW, ContactStatus.IN_PROGRESS] }
    }).sort({ priority: -1, createdAt: -1 });
};

contactSchema.statics.getStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);
};

// Instance methods
contactSchema.methods.assignTo = function(adminId: string) {
    this.assignedTo = adminId;
    if (this.status === ContactStatus.NEW) {
        this.status = ContactStatus.IN_PROGRESS;
    }
    return this.save();
};

contactSchema.methods.addResponse = function(response: string, adminId: string) {
    this.adminResponse = response;
    this.responseDate = new Date();
    this.status = ContactStatus.IN_PROGRESS;
    
    // Add internal note
    this.internalNotes.push({
        note: `Response sent: ${response.substring(0, 100)}...`,
        addedBy: adminId,
        addedAt: new Date()
    });
    
    return this.save();
};

contactSchema.methods.resolve = function(adminId?: string) {
    this.status = ContactStatus.RESOLVED;
    this.resolvedDate = new Date();
    
    if (adminId) {
        this.internalNotes.push({
            note: "Contact marked as resolved",
            addedBy: adminId,
            addedAt: new Date()
        });
    }
    
    return this.save();
};

contactSchema.methods.close = function(adminId?: string) {
    this.status = ContactStatus.CLOSED;
    this.closedDate = new Date();
    
    if (adminId) {
        this.internalNotes.push({
            note: "Contact closed",
            addedBy: adminId,
            addedAt: new Date()
        });
    }
    
    return this.save();
};

contactSchema.methods.addInternalNote = function(note: string, adminId: string) {
    this.internalNotes.push({
        note,
        addedBy: adminId,
        addedAt: new Date()
    });
    
    return this.save();
};

export type ContactDocument = InferSchemaType<typeof contactSchema> & {
    assignTo(adminId: string): Promise<ContactDocument>;
    addResponse(response: string, adminId: string): Promise<ContactDocument>;
    resolve(adminId?: string): Promise<ContactDocument>;
    close(adminId?: string): Promise<ContactDocument>;
    addInternalNote(note: string, adminId: string): Promise<ContactDocument>;
    fullName: string;
    responseTime: number | null;
    resolutionTime: number | null;
};

export const Contact: Model<ContactDocument> & {
    findByStatus(status: ContactStatus): Promise<ContactDocument[]>;
    findByCategory(category: ContactCategory): Promise<ContactDocument[]>;
    findByPriority(priority: ContactPriority): Promise<ContactDocument[]>;
    findAssignedTo(adminId: string): Promise<ContactDocument[]>;
    findUnassigned(): Promise<ContactDocument[]>;
    getStats(): Promise<any[]>;
} = (mongoose.models.Contact as any) || mongoose.model<ContactDocument>("Contact", contactSchema);
