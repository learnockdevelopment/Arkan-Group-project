export function isValidEmail(email: string): boolean {
    return /\S+@\S+\.\S+/.test(email);
}

export function isValidPhone(phone: string): boolean {
    return /^\+?[1-9]\d{7,14}$/.test(phone);
}

export function isValidPin(pin: string): boolean {
    if (!/^\d{6}$/.test(pin)) return false; // 6 digits
    // all digits unique
    const set = new Set(pin.split(""));
    if (set.size !== 6) return false;
    // not straight ascending or descending
    const ascending = pin.split("").every((d, i, arr) => (i === 0 ? true : Number(d) === Number(arr[i - 1]) + 1));
    const descending = pin.split("").every((d, i, arr) => (i === 0 ? true : Number(d) === Number(arr[i - 1]) - 1));
    if (ascending || descending) return false;
    return true;
}


