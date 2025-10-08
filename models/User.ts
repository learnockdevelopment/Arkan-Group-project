import mongoose, { Schema, InferSchemaType, Model } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, index: true },
        phone: { type: String, required: true, unique: true, index: true },
        pinHash: { type: String, required: false, select: false },
        passwordHash: { type: String, required: false, select: false },
        emailVerifiedAt: { type: Date },
        phoneVerifiedAt: { type: Date },
        isVerified: { type: Boolean, default: false }, // ID verification status
        roleId: { type: Schema.Types.ObjectId, ref: "Role", required: false },
        avatarUrl: { type: String },
        walletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
        status: { type: String, enum: ["pending", "active", "banned"], default: "pending", index: true },
    },
    { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });

userSchema.methods.setPin = async function (pin: string) {
    const salt = await bcrypt.genSalt(12);
    this.pinHash = await bcrypt.hash(pin, salt);
};

userSchema.methods.comparePin = async function (pin: string): Promise<boolean> {
    if (!this.pinHash) return false;
    return bcrypt.compare(pin, this.pinHash);
};

export type UserDocument = InferSchemaType<typeof userSchema> & {
    setPin(pin: string): Promise<void>;
    comparePin(pin: string): Promise<boolean>;
};

export const User: Model<UserDocument> =
    (mongoose.models.User as Model<UserDocument>) ||
    mongoose.model<UserDocument>("User", userSchema);


