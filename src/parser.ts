import { abiToString, isaToString, objectTypeToString, elfFlagsToString } from "./strings";
import { ELF, ABI, ISA, ObjectType, ELFOpenResult, SymbolType } from "./types";
import { readProgramHeaderEntries } from "./segments";
import { readSectionHeaderEntries } from "./sections";
import { Reader } from "./reader";
import { virtualAddressToFileOffset } from "./elf";
import { add, toNumberSafe } from "./biginthelpers";
import { read } from "fs";


/** Options for reading an ELF file. */
export interface OpenOptions {
    /** When true, the data for symbols will also be read */
    readSymbolData: boolean
};

async function updateSymbolAddressesAndLoadSymbols(elf: ELF, reader: Reader, loadSymbols: boolean) {
    const readerSize = await reader.size();
    const elftype = elf.type;
    if (elftype === ObjectType.Executable || elftype === ObjectType.Relocatable || elftype === ObjectType.Shared) {
        for (const section of elf.sections) {
            if (section.symbols) {
                for (const symbol of section.symbols) {
                    if (elftype === ObjectType.Relocatable) {
                        if (symbol.shndx < elf.sections.length) {
                            // offset is from start of section
                            symbol.virtualAddress = add(symbol.value, elf.sections[symbol.shndx].addr);
                        } else if (symbol.shndx == 0xfff1) {
                            // SHN_ABS
                            symbol.virtualAddress = symbol.value;
                        }
                    } else {
                        // the value is the virtual address
                        symbol.virtualAddress = symbol.value;
                    }

                    if (loadSymbols && symbol.virtualAddress &&
                        (symbol.type === SymbolType.Function || symbol.type === SymbolType.Object) &&
                        symbol.size) {
                        const fileOffset = virtualAddressToFileOffset(elf, symbol.value);
                        if (fileOffset) {
                            if (fileOffset + symbol.size <= readerSize) {
                                symbol.data = await reader.read(symbol.size, fileOffset);
                            } else {
                                debugger;
                            }
                        }
                    }
                }
            }
        }
    }
}

export async function readElf(reader: Reader, options: OpenOptions): Promise<ELFOpenResult> {

    let success = false;
    const errors = [];
    const warnings = [];
    let elf: ELF | undefined;

    try {

        await reader.open();

        const size = await reader.size();
        if (size <= 0x40) {
            errors.push("Not a valid ELF file. Too small.");
        } else {
            const view = await reader.view(16);

            const magic = 0x464c457f;
            if (view.getInt32(0, true) !== magic) {
                warnings.push("Not a valid ELF file. The file does not start with 0x7f ELF.");
            }

            const eiClass = view.getUint8(4);
            const eiData = view.getUint8(5);
            const eiVer = view.getUint8(6);
            const eiAbi = view.getUint8(7);
            const eiAbiVer = view.getUint8(8);

            if (eiClass < 1 || eiClass > 2) {
                errors.push("Not a valid ELF file. Class is invalid");
            }

            if (eiData < 1 || eiData > 2) {
                errors.push("Not a valid ELF file. Endianness is invalid");
            }

            if (eiVer != 1) {
                warnings.push("Not a valid ELF file. Version is invalid");
            }

            if (errors.length == 0) {

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
                    ePHOff = toNumberSafe(readUInt64(ix)); ix += 8;
                    eSHOff = toNumberSafe(readUInt64(ix)); ix += 8;
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
                    errors.push("Invalid ELF file. Unexpected header size");
                }

                if ((ePHNum != 0 && (ePHOff < eHSize || ePHOff > size)) ||
                    (eSHNum != 0 && (eSHOff < eHSize || eSHOff > size))) {
                    errors.push("Invalid ELF file. Invalid offsets");
                }

                if (ePHNum != 0 && ((bits == 32 && ePHEntSize < 0x20) ||
                    (bits == 64 && ePHEntSize < 0x38) ||
                    (ePHEntSize > 0xff))) {
                    errors.push("Invalid ELF file. Program header entry size invalid");
                }

                if (eSHNum != 0 && ((bits == 32 && eSHEntSize < 0x28) ||
                    (bits == 64 && eSHEntSize < 0x40) ||
                    (ePHEntSize > 0xff))) {
                    errors.push("Invalid ELF file. Section header entry size invalid");
                }

                if (errors.length == 0) {
                    const type = eType as ObjectType;
                    const isa = eMachine as ISA;

                    const segments = await readProgramHeaderEntries(
                        reader, ePHOff,
                        ePHEntSize, ePHNum,
                        bits, bigEndian);
                    const sections = await readSectionHeaderEntries(
                        reader, eSHOff,
                        eSHEntSize, eSHNum,
                        bits, bigEndian, eSHStrNdx,
                        options.readSymbolData);

                    elf = {
                        path: reader.path,
                        class: eiClass,
                        classDescription: eiClass == 1 ? 'ELF32' : 'ELF64',
                        data: eiData,
                        dataDescription: eiData == 1 ? 'Little endian' : 'Big endian',
                        version: eiVer,
                        bits: bits,
                        abi: abi,
                        abiVersion: eiAbiVer,
                        abiDescription: abiToString(abi),
                        isa: isa,
                        isaDescription: isaToString(isa),
                        isaVersion: eVersion,
                        type: type,
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
                        segments,
                        sections,
                    }

                    await updateSymbolAddressesAndLoadSymbols(elf, reader, options.readSymbolData);
                    success = true;
                }
            }
        }
    } catch (e) {
        errors.push(`Exception caught: ${e.toString()}`);
    }

    // close the file
    if (reader) {
        try {
            await reader.close();
        } catch (e) {
            errors.push(`Exception caught: ${e.toString()}`);
        }
    }

    return {
        success,
        errors,
        warnings,
        elf
    };
}