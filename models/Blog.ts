import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

export enum BlogStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}

export enum BlogCategory {
    REAL_ESTATE = "real_estate",
    INVESTMENT = "investment",
    MARKET_NEWS = "market_news",
    TIPS = "tips",
    COMPANY_NEWS = "company_news",
    GENERAL = "general"
}

const blogSchema = new Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 200 },
        slug: { type: String, required: true, unique: true, lowercase: true, index: true },
        excerpt: { type: String, required: true, maxlength: 500 },
        content: { type: String, required: true },
        
        // Media
        featuredImage: { type: String, required: true }, // URL to featured image
        images: [{ type: String }], // Additional images
        
        // Categorization
        category: { 
            type: String, 
            enum: Object.values(BlogCategory),
            default: BlogCategory.GENERAL,
            index: true 
        },
        tags: [{ type: String, trim: true }],
        
        // Author
        authorId: { 
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: true,
            index: true 
        },
        
        // Status and Publishing
        status: { 
            type: String, 
            enum: Object.values(BlogStatus),
            default: BlogStatus.DRAFT,
            index: true 
        },
        publishedAt: { type: Date },
        
        // SEO
        metaTitle: { type: String, maxlength: 60 },
        metaDescription: { type: String, maxlength: 160 },
        keywords: [{ type: String }],
        
        // Engagement
        viewCount: { type: Number, default: 0, min: 0 },
        likeCount: { type: Number, default: 0, min: 0 },
        shareCount: { type: Number, default: 0, min: 0 },
        
        // Reading time (in minutes)
        readingTime: { type: Number, min: 1 },
        
        // Featured status
        isFeatured: { type: Boolean, default: false, index: true },
        
        // Comments enabled
        commentsEnabled: { type: Boolean, default: true },
        
        // Related posts
        relatedPosts: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
        
        // Archive date (for archived posts)
        archivedAt: { type: Date },
        
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for better performance
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ authorId: 1, status: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ isFeatured: 1, status: 1 });
blogSchema.index({ createdAt: -1 });

// Text search index
blogSchema.index({ 
    title: 'text', 
    excerpt: 'text', 
    content: 'text', 
    tags: 'text' 
});

// Virtual for reading time calculation
blogSchema.virtual('estimatedReadingTime').get(function() {
    if (this.readingTime) return this.readingTime;
    
    // Calculate based on content length (average 200 words per minute)
    const wordCount = this.content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
});

// Virtual for URL-friendly slug
blogSchema.virtual('url').get(function() {
    return `/blog/${this.slug}`;
});

// Pre-save middleware
blogSchema.pre('save', function(next) {
    // Generate slug if not provided
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }
    
    // Set published date when status changes to published
    if (this.status === BlogStatus.PUBLISHED && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    
    // Set archived date when status changes to archived
    if (this.status === BlogStatus.ARCHIVED && !this.archivedAt) {
        this.archivedAt = new Date();
    }
    
    // Calculate reading time if not set
    if (!this.readingTime && this.content) {
        const wordCount = this.content.split(/\s+/).length;
        this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    
    // Set meta fields if not provided
    if (!this.metaTitle) {
        this.metaTitle = this.title.substring(0, 60);
    }
    
    if (!this.metaDescription) {
        this.metaDescription = this.excerpt.substring(0, 160);
    }
    
    next();
});

// Static methods
blogSchema.statics.findPublished = function(options: any = {}) {
    return this.find({ 
        status: BlogStatus.PUBLISHED,
        publishedAt: { $lte: new Date() }
    }).sort({ publishedAt: -1, ...options.sort });
};

blogSchema.statics.findByCategory = function(category: BlogCategory) {
    return this.find({ 
        category, 
        status: BlogStatus.PUBLISHED,
        publishedAt: { $lte: new Date() }
    }).sort({ publishedAt: -1 });
};

blogSchema.statics.findFeatured = function(limit: number = 5) {
    return this.find({ 
        isFeatured: true,
        status: BlogStatus.PUBLISHED,
        publishedAt: { $lte: new Date() }
    }).sort({ publishedAt: -1 }).limit(limit);
};

blogSchema.statics.searchPosts = function(query: string, options: any = {}) {
    return this.find({
        $text: { $search: query },
        status: BlogStatus.PUBLISHED,
        publishedAt: { $lte: new Date() }
    }, {
        score: { $meta: 'textScore' }
    }).sort({ 
        score: { $meta: 'textScore' },
        publishedAt: -1 
    }).limit(options.limit || 20);
};

// Instance methods
blogSchema.methods.incrementView = function() {
    this.viewCount += 1;
    return this.save();
};

blogSchema.methods.incrementLike = function() {
    this.likeCount += 1;
    return this.save();
};

blogSchema.methods.incrementShare = function() {
    this.shareCount += 1;
    return this.save();
};

blogSchema.methods.publish = function() {
    this.status = BlogStatus.PUBLISHED;
    this.publishedAt = new Date();
    return this.save();
};

blogSchema.methods.archive = function() {
    this.status = BlogStatus.ARCHIVED;
    this.archivedAt = new Date();
    return this.save();
};

export type BlogDocument = InferSchemaType<typeof blogSchema> & {
    incrementView(): Promise<BlogDocument>;
    incrementLike(): Promise<BlogDocument>;
    incrementShare(): Promise<BlogDocument>;
    publish(): Promise<BlogDocument>;
    archive(): Promise<BlogDocument>;
    estimatedReadingTime: number;
    url: string;
};

export const Blog: Model<BlogDocument> & {
    findPublished(options?: any): Promise<BlogDocument[]>;
    findByCategory(category: BlogCategory): Promise<BlogDocument[]>;
    findFeatured(limit?: number): Promise<BlogDocument[]>;
    searchPosts(query: string, options?: any): Promise<BlogDocument[]>;
} = (mongoose.models.Blog as any) || mongoose.model<BlogDocument>("Blog", blogSchema);
