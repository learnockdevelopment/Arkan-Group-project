import { addMinutes } from "date-fns";
import { OtpCode } from "@/models/OtpCode";

export function generateOtp(length = 6): string {
    let code = "";
    for (let i = 0; i < length; i++) code += Math.floor(Math.random() * 10);
    return code;
}

export async function createOtp(target: string, channel: "email" | "phone", purpose: string, ttlMinutes = 10) {
    const code = generateOtp(6);
    const expiresAt = addMinutes(new Date(), ttlMinutes);
    await OtpCode.create({ target, channel, code, purpose, expiresAt });
    return { code, expiresAt };
}

export async function verifyOtp(target: string, channel: "email" | "phone", purpose: string, code: string) {
    const record = await OtpCode.findOne({ target, channel, purpose }).sort({ createdAt: -1 });
    if (!record) return { ok: false, reason: "not_found" as const };
    if (record.consumedAt) return { ok: false, reason: "consumed" as const };
    if (record.expiresAt < new Date()) return { ok: false, reason: "expired" as const };
    if (record.code !== code) return { ok: false, reason: "mismatch" as const };
    record.consumedAt = new Date();
    await record.save();
    return { ok: true as const };
}


