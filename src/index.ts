import { abiToString, isaToString, objectTypeToString, elfFlagsToString } from "./strings";
import { ABI, ISA, ObjectType, ELFOpenResult } from "./types";
import { readProgramHeaderEntries } from "./programHeaders";
import { readSectionHeaderEntries } from "./sections";
import { Reader } from "./reader";
import * as reader from "./reader";
import { Buffer } from 'buffer';
import { FileHandle } from "fs/promises";


async function openInternal(reader: Reader): Promise<ELFOpenResult> {

    const result: ELFOpenResult = {
        success: false,
        errors: [],
        warnings: [],
        elf: null
    };

    try {

        await reader.open();

        const size = await reader.size();
        if (size <= 0x40) {
            result.errors.push("Not a valid ELF file. Too small.");
        } else {

            var eident = Buffer.alloc(16);
            await reader.read(eident, 0, 16);

            const magic = 0x464c457f;
            if (eident.readInt32LE(0) !== magic) {
                result.warnings.push("Not a valid ELF file. The file does not start with 0x7f ELF.");
            }

            const eiClass = eident.readUInt8(4);
            const eiData = eident.readUInt8(5);
            const eiVer = eident.readUInt8(6);
            const eiAbi = eident.readUInt8(7);
            const eiAbiVer = eident.readUInt8(8);

            if (eiClass < 1 || eiClass > 2) {
                result.errors.push("Not a valid ELF file. Class is invalid");
            }

            if (eiData < 1 || eiData > 2) {
                result.errors.push("Not a valid ELF file. Endianness is invalid");
            }

            if (eiVer != 1) {
                result.warnings.push("Not a valid ELF file. Version is invalid");
            }

            if (result.errors.length == 0) {

                const bits = eiClass === 1 ? 32 : 64;
                const bigEndian = eiData !== 1;
                const abi = eiAbi as ABI;
                const sizeLeft = bits == 32 ? 0x24 : 0x30;
                const eheader = Buffer.alloc(sizeLeft);
                await reader.read(eheader, 0, sizeLeft);
                const readUInt16 = (bigEndian ? Buffer.prototype.readUInt16BE : Buffer.prototype.readUInt16LE).bind(eheader);
                const readUInt32 = (bigEndian ? Buffer.prototype.readUInt32BE : Buffer.prototype.readUInt32LE).bind(eheader);
                const readUInt64 = (bigEndian ? Buffer.prototype.readBigUInt64BE : Buffer.prototype.readBigUInt64LE).bind(eheader);

                let ix = 0;
                const eType = readUInt16(ix); ix += 2;
                const eMachine = readUInt16(ix); ix += 2;
                const eVersion = readUInt32(ix); ix += 4;
                let eEntry, ePHOff, eSHOff;
                if (bits === 32) {
                    eEntry = readUInt32(ix); ix += 4;
                    ePHOff = readUInt32(ix); ix += 4;
                    eSHOff = readUInt32(ix); ix += 4;
                } else {
                    eEntry = Number(readUInt64(ix)); ix += 8;
                    ePHOff = Number(readUInt64(ix)); ix += 8;
                    eSHOff = Number(readUInt64(ix)); ix += 8;
                }
                const eFlags = readUInt32(ix); ix += 4;
                const eHSize = readUInt16(ix); ix += 2;
                const ePHEntSize = readUInt16(ix); ix += 2;
                const ePHNum = readUInt16(ix); ix += 2;
                const eSHEntSize = readUInt16(ix); ix += 2;
                const eSHNum = readUInt16(ix); ix += 2;
                const eSHStrNdx = readUInt16(ix); ix += 2;

                if (bits === 32 && eHSize !== 0x34 ||
                    bits == 64 && eHSize !== 0x40) {
                    result.errors.push("Invalid ELF file. Unexpected header size");
                }

                if ((ePHNum != 0 && (ePHOff < eHSize || ePHOff > size)) ||
                    (eSHNum != 0 && (eSHOff < eHSize || eSHOff > size))) {
                    result.errors.push("Invalid ELF file. Invalid offsets");
                }

                if (ePHNum != 0 && ((bits == 32 && ePHEntSize < 0x20) ||
                    (bits == 64 && ePHEntSize < 0x38) ||
                    (ePHEntSize > 0xff))) {
                    result.errors.push("Invalid ELF file. Program header entry size invalid");
                }

                if (eSHNum != 0 && ((bits == 32 && eSHEntSize < 0x28) ||
                    (bits == 64 && eSHEntSize < 0x40) ||
                    (ePHEntSize > 0xff))) {
                    result.errors.push("Invalid ELF file. Section header entry size invalid");
                }

                if (result.errors.length == 0) {
                    const type = eType as ObjectType;
                    const isa = eMachine as ISA;

                    const programHeaderEntries = await readProgramHeaderEntries(reader, ePHOff, ePHEntSize, ePHNum, bits, bigEndian);
                    const sectionHeaderEntries = await readSectionHeaderEntries(reader, eSHOff, eSHEntSize, eSHNum, bits, bigEndian, eSHStrNdx);

                    result.elf = {
                        path: null,
                        class: eiClass,
                        classDescription: eiClass == 1 ? 'ELF32' : 'ELF64',
                        data: eiData,
                        dataDescription: eiData == 1 ? 'Little endian' : 'Big endian',
                        version: eiVer,
                        bits,
                        abi,
                        abiVersion: eiAbiVer,
                        abiDescription: abiToString(abi),
                        isa,
                        isaDescription: isaToString(isa),
                        isaVersion: eVersion,
                        type,
                        typeDescription: objectTypeToString(type),
                        flags: eFlags,
                        flagsDescription: elfFlagsToString(isa, eFlags),
                        entryPoint: eEntry,
                        programHeaderOffset: ePHOff,
                        programHeaderEntrySize: ePHEntSize,
                        numProgramHeaderEntries: ePHNum,
                        sectionHeaderOffset: eSHOff,
                        sectionHeaderEntrySize: eSHEntSize,
                        numSectionHeaderEntries: eSHNum,
                        shstrIndex: eSHStrNdx,
                        programHeaderEntries,
                        sectionHeaderEntries
                    };
                    result.success = true;
                }
            }
        }
    } catch (e) {
        result.errors.push(`Exception caught: ${e.toString()}`);
    }

    // close the file
    if (reader) {
        try {
            await reader.close();
        } catch (e) {
            result.errors.push(`Exception caught: ${e.toString()}`);
        }
    }

    return result;
}

function isClass(item: any, type: string) {
    return typeof item == "object" &&
        item.constructor &&
        item.constructor.name === type;
}

function isBuffer(item: any) {
    if (item instanceof Buffer) {
        return true;
    } else {
        return isClass(item, 'Buffer');
    }
}

function isAsyncFileHandle(item: any) {
    return isClass(item, 'FileHandle');
}

function isArrayBuffer(item: any) {
    if (item instanceof ArrayBuffer) {
        return true;
    } else {
        return isClass(item, 'ArrayBuffer');
    }
}

function isBlob(item: any) {
    if (this && this.Blob && item instanceof this.Blob) {
        return true;
    } else {
        return isClass(item, 'Blob');
    }
}

export function open(pathOrDataOrFile: string | Buffer | ArrayBuffer | Blob | FileHandle | number, callback: (result: ELFOpenResult) => void | null = null): Promise<ELFOpenResult> {

    let promise: Promise<ELFOpenResult>;

    if (typeof pathOrDataOrFile == "string") {
        promise = openInternal(reader.path(pathOrDataOrFile));
    } else if (isBuffer(pathOrDataOrFile)) {
        promise = openInternal(reader.buffer(<Buffer>pathOrDataOrFile));
    } else if (isAsyncFileHandle(pathOrDataOrFile)) {
        promise = openInternal(reader.asyncfile(pathOrDataOrFile));
    } else if (typeof pathOrDataOrFile == "number") {
        promise = openInternal(reader.syncfile(pathOrDataOrFile));
    } else if (isArrayBuffer(pathOrDataOrFile)) {
        promise = openInternal(reader.buffer(<ArrayBuffer>pathOrDataOrFile));
    } else if (isBlob(pathOrDataOrFile)) {
        promise = openInternal(reader.blob(<Blob>pathOrDataOrFile));
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