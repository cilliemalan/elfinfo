
export function subtract(a: number | bigint, b: number | bigint): number | bigint {
    if (typeof a == 'bigint' && typeof b == 'bigint') {
        return a - b;
    } else if (typeof a == 'number' && typeof b == 'number') {
        return a - b;
    } else {
        return BigInt(a) - BigInt(b);
    }
}

export function add(a: number | bigint, b: number | bigint): number | bigint {
    if (typeof a == 'bigint' && typeof b == 'bigint') {
        return a + b;
    } else if (typeof a == 'number' && typeof b == 'number') {
        return a + b;
    } else {
        return BigInt(a) + BigInt(b);
    }
}

export function divide(a: number | bigint, b: number | bigint): number | bigint {
    if (typeof a == 'bigint' && typeof b == 'bigint') {
        return a / b;
    } else if (typeof a == 'number' && typeof b == 'number') {
        return parseInt(<any>(a / b));
    } else {
        return BigInt(a) / BigInt(b);
    }
}


const tooBigInt = BigInt(1e51);
export function toNumberSafe(a: number | bigint, warnings?: string[]) : number {
    if (typeof a === 'bigint') {
        if (a > tooBigInt) {
            if (warnings) {
                warnings.push('BigInt Overflow');
            } else {
                throw new Error('BigInt Overflow');
            }
        } else {
            return Number(a);
        }
    } else if (typeof a === 'number') {
        return a;
    }
    throw new Error('Invalid Input for BigInt conversion');
}