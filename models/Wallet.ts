import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const walletSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        balance: { type: Number, default: 0 },
        currency: { type: String, default: "USD" },
    },
    { timestamps: true }
);

walletSchema.index({ userId: 1 }, { unique: true });

export type WalletDocument = InferSchemaType<typeof walletSchema>;

export const Wallet: Model<WalletDocument> =
    (mongoose.models.Wallet as Model<WalletDocument>) ||
    mongoose.model<WalletDocument>("Wallet", walletSchema);


