
export function subtract(a: number | BigInt, b: number | BigInt): number | BigInt {
    if (typeof a == 'bigint' && typeof b == 'bigint') {
        return a - b;
    } else if (typeof a == 'number' && typeof b == 'number') {
        return a - b;
    } else {
        return BigInt(a) - BigInt(b);
    }
}

export function add(a: number | BigInt, b: number | BigInt): number | BigInt {
    if (typeof a == 'bigint' && typeof b == 'bigint') {
        return a + b;
    } else if (typeof a == 'number' && typeof b == 'number') {
        return a + b;
    } else {
        return BigInt(a) + BigInt(b);
    }
}

export function divide(a: number | BigInt, b: number | BigInt): number | BigInt {
    if (typeof a == 'bigint' && typeof b == 'bigint') {
        return a / b;
    } else if (typeof a == 'number' && typeof b == 'number') {
        return parseInt(<any>(a / b));
    } else {
        return BigInt(a) / BigInt(b);
    }
}