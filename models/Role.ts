import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const roleSchema = new Schema(
    {
        name: { type: String, required: true, unique: true }, // admin, user, owner
        permissions: [{ type: String }],
        description: { type: String },
    },
    { timestamps: true }
);

export type RoleDocument = InferSchemaType<typeof roleSchema>;

export const Role: Model<RoleDocument> =
    (mongoose.models.Role as Model<RoleDocument>) ||
    mongoose.model<RoleDocument>("Role", roleSchema);


