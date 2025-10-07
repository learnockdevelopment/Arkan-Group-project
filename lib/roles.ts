import { Role } from "@/models/Role";

export async function ensureDefaultRoles() {
    const defaults = [
        { name: "admin", description: "Administrator", permissions: ["*:"] },
        { name: "owner", description: "Owner", permissions: [] },
        { name: "user", description: "Standard user", permissions: [] },
    ];
    for (const r of defaults) {
        await Role.updateOne({ name: r.name }, { $setOnInsert: r }, { upsert: true });
    }
}

export async function getRoleByName(name: string) {
    return Role.findOne({ name });
}


