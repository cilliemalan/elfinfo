import { ELFOpenResult } from "./types";
import * as reader from "./reader";
import { FileHandle } from "fs/promises";

import { readElf } from "./parser";

function isClass(item: any, type: string) {
    return (this && this[type] &&
        typeof this[type] == 'function' &&
        item instanceof this[type]) ||
        (typeof item == "object" &&
            item.constructor &&
            item.constructor.name === type);
}

function isBuffer(item: any): item is Buffer {
    return isClass(item, 'Buffer');
}

function isUint8Array(item: any): item is Uint8Array {
    return isClass(item, 'Uint8Array');
}

function isAsyncFileHandle(item: any): item is FileHandle {
    return isClass(item, 'FileHandle');
}

function isArrayBuffer(item: any): item is ArrayBuffer {
    return isClass(item, 'ArrayBuffer');
}

function isBlob(item: any): item is Blob {
    return isClass(item, 'Blob');
}

/**
 * Parse an ELF file.
 * @summary Parsing will be async if a path, blob, or file handle is specified and synchronous if an array or buffer is specified.
 * @param {any} pathOrDataOrFile the path to the ELF file, or the data for the file.
 * @param {function} [callback] When specified, this will be called after the file is done parsing.
 * @returns {Promise<ELFOpenResult>} a result indicating the success or failure of parsing and the data for the ELF file.
 */
export function open(pathOrDataOrFile: string | Uint8Array | Buffer | ArrayBuffer | Blob | FileHandle | Array<number> | number, callback: (result: ELFOpenResult) => void | null = null): Promise<ELFOpenResult> {

    let promise: Promise<ELFOpenResult>;

    if (typeof pathOrDataOrFile == "string") {
        promise = readElf(reader.path(pathOrDataOrFile));
    } else if (isBuffer(pathOrDataOrFile)) {
        promise = readElf(reader.buffer(pathOrDataOrFile));
    } else if (isAsyncFileHandle(pathOrDataOrFile)) {
        promise = readElf(reader.asyncfile(pathOrDataOrFile));
    } else if (typeof pathOrDataOrFile == "number") {
        promise = readElf(reader.syncfile(pathOrDataOrFile));
    } else if (isArrayBuffer(pathOrDataOrFile)) {
        promise = readElf(reader.buffer(<ArrayBuffer>pathOrDataOrFile));
    } else if (isBlob(pathOrDataOrFile)) {
        promise = readElf(reader.blob(pathOrDataOrFile));
    } else if (isUint8Array(pathOrDataOrFile)) {
        promise = readElf(reader.buffer(pathOrDataOrFile));
    } else if (Array.isArray(pathOrDataOrFile)) {
        promise = readElf(reader.array(pathOrDataOrFile));
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

export * from './elf';
export * from './types';
export * from './debug';
