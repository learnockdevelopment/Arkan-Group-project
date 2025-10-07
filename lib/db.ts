import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = (global as any).mongooseCache || {
    conn: null,
    promise: null,
};

export async function connectToDatabase(): Promise<typeof mongoose> {
    if (cached.conn) return cached.conn;
    if (!MONGODB_URI) {
        throw new Error("MONGODB_URI is not set in environment variables");
    }
    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI, {
                // leave options empty for mongoose v8 recommended defaults
                dbName: process.env.MONGODB_DBNAME || undefined,
            })
            .then((m) => m);
    }
    cached.conn = await cached.promise;
    (global as any).mongooseCache = cached;
    return cached.conn;
}

export async function disconnectFromDatabase(): Promise<void> {
    if (cached.conn) {
        await mongoose.disconnect();
        cached.conn = null;
        cached.promise = null;
    }
}

export async function isDbConnected(): Promise<boolean> {
    const states = mongoose.connections.map((c) => c.readyState);
    return states.some((s) => s === 1); // 1 = connected
}


