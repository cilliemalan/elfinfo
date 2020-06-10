import { ELFOpenResult } from "./types";
import * as reader from "./reader";
import { FileHandle } from "fs/promises";

import { readElf } from "./elf";

function isClass(item: any, type: string) {
    return (this && this[type] &&
        typeof this[type] == 'function' &&
        item instanceof this[type]) ||
        (typeof item == "object" &&
            item.constructor &&
            item.constructor.name === type);
}

function isBuffer(item: any) {
    return isClass(item, 'Buffer');
}

function isAsyncFileHandle(item: any) {
    return isClass(item, 'FileHandle');
}

function isArrayBuffer(item: any) {
    return isClass(item, 'ArrayBuffer');
}

function isBlob(item: any) {
    return isClass(item, 'Blob');
}

export function open(pathOrDataOrFile: string | Buffer | ArrayBuffer | Blob | FileHandle | number, callback: (result: ELFOpenResult) => void | null = null): Promise<ELFOpenResult> {

    let promise: Promise<ELFOpenResult>;

    if (typeof pathOrDataOrFile == "string") {
        promise = readElf(reader.path(pathOrDataOrFile));
    } else if (isBuffer(pathOrDataOrFile)) {
        promise = readElf(reader.buffer(<Buffer>pathOrDataOrFile));
    } else if (isAsyncFileHandle(pathOrDataOrFile)) {
        promise = readElf(reader.asyncfile(pathOrDataOrFile));
    } else if (typeof pathOrDataOrFile == "number") {
        promise = readElf(reader.syncfile(pathOrDataOrFile));
    } else if (isArrayBuffer(pathOrDataOrFile)) {
        promise = readElf(reader.buffer(<ArrayBuffer>pathOrDataOrFile));
    } else if (isBlob(pathOrDataOrFile)) {
        promise = readElf(reader.blob(<Blob>pathOrDataOrFile));
    } else {
        promise = new Promise((resolve) => {
            resolve({
                success: false,
                errors: ['unsupported input type'],
                warnings: [],
                elf: null
            });
        })
    }

    if (callback) {
        promise.then(callback);
    }

    return promise;
}

export * from './types';
export * from './strings';
export * from './debug';
