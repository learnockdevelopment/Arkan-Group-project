import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const otpCodeSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        target: { type: String, required: true }, // email or phone value
        channel: { type: String, enum: ["email", "phone"], required: true },
        code: { type: String, required: true },
        purpose: { type: String, enum: ["register_email", "register_phone", "password_reset", "email_change", "phone_change"], required: true },
        expiresAt: { type: Date, required: true },
        consumedAt: { type: Date },
    },
    { timestamps: true }
);

otpCodeSchema.index({ target: 1, channel: 1, purpose: 1 });

export type OtpCodeDocument = InferSchemaType<typeof otpCodeSchema>;

export const OtpCode: Model<OtpCodeDocument> =
    (mongoose.models.OtpCode as Model<OtpCodeDocument>) ||
    mongoose.model<OtpCodeDocument>("OtpCode", otpCodeSchema);


