import { abiToString, isaToString, objectTypeToString, elfFlagsToString } from "./strings";
import { ABI, ISA, ObjectType, ELFOpenResult } from "./types";
import { readProgramHeaderEntries } from "./segments";
import { readSectionHeaderEntries } from "./sections";
import { Reader } from "./reader";
import { ELF } from "./elf";

export async function readElf(reader: Reader): Promise<ELFOpenResult> {

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
            const view = await reader.view(16);

            const magic = 0x464c457f;
            if (view.getInt32(0, true) !== magic) {
                result.warnings.push("Not a valid ELF file. The file does not start with 0x7f ELF.");
            }

            const eiClass = view.getUint8(4);
            const eiData = view.getUint8(5);
            const eiVer = view.getUint8(6);
            const eiAbi = view.getUint8(7);
            const eiAbiVer = view.getUint8(8);

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
                const headerview = await reader.view(sizeLeft);
                const readUInt16 = (ix: number) => headerview.getUint16(ix, !bigEndian);
                const readUInt32 = (ix: number) => headerview.getUint32(ix, !bigEndian);
                const readUInt64 = (ix: number) => headerview.getBigInt64(ix, !bigEndian);

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
                    eEntry = readUInt64(ix); ix += 8;
                    ePHOff = readUInt64(ix); ix += 8;
                    eSHOff = readUInt64(ix); ix += 8;
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

                    const elf = new ELF();
                    elf.path = null;
                    elf.class = eiClass;
                    elf.classDescription = eiClass == 1 ? 'ELF32' : 'ELF64';
                    elf.data = eiData;
                    elf.dataDescription = eiData == 1 ? 'Little endian' : 'Big endian';
                    elf.version = eiVer;
                    elf.bits = bits;
                    elf.abi = abi;
                    elf.abiVersion = eiAbiVer;
                    elf.abiDescription = abiToString(abi);
                    elf.isa = isa;
                    elf.isaDescription = isaToString(isa);
                    elf.isaVersion = eVersion;
                    elf.type = type;
                    elf.typeDescription = objectTypeToString(type);
                    elf.flags = eFlags;
                    elf.flagsDescription = elfFlagsToString(isa, eFlags);
                    elf.entryPoint = eEntry;
                    elf.programHeaderOffset = ePHOff;
                    elf.programHeaderEntrySize = ePHEntSize;
                    elf.numProgramHeaderEntries = ePHNum;
                    elf.sectionHeaderOffset = eSHOff;
                    elf.sectionHeaderEntrySize = eSHEntSize;
                    elf.numSectionHeaderEntries = eSHNum;
                    elf.shstrIndex = eSHStrNdx;
                    elf.segments = await readProgramHeaderEntries(reader, ePHOff, ePHEntSize, ePHNum, bits, bigEndian);
                    elf.sections = await readSectionHeaderEntries(reader, eSHOff, eSHEntSize, eSHNum, bits, bigEndian, eSHStrNdx);

                    result.elf = elf;
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