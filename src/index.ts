import * as fs from "fs";
import {
    ABIToString, ISAToString, ObjectTypeToString, ProgramHeaderEntryTypeToString,
    SectionHeaderEntryTypeToString, elfFlagsToString, programHeaderFlagsToString, sectionFlagsToString,
    shndxToString, symbolBindingToString, symbolTypeToString, symbolVisibilityToString
} from "./strings";
import {
    ABI, ISA, ObjectType, ProgramHeaderEntryType, SectionHeaderEntryType,
    SymbolBinding, SymbolType, SymbolVisibility
} from "./types";

const MAX_SECTION_LOAD_SIZE = 0x1000000;



export interface ElfOpenResult {
    success: boolean;
    errors: string[];
    warnings: string[];
    elf: ElfFile;
}

export interface ElfFile {
    path: string;
    bits: number;
    abi: ABI;
    abiDescription: string;
    type: ObjectType;
    typeDescription: string;
    isa: ISA;
    isaDescription: string;
    flags: number;
    flagsDescription: string;
    entryPoint: number;
    programHeaderOffset: number;
    sectionHeaderOffset: number;
    programHeaderEntrySize: number;
    numProgramHeaderEntries: number;
    sectionHeaderEntrySize: number;
    numSectionHeaderEntries: number;
    shstrIndex: number;
    programHeaderEntries: ElfProgramHeaderEntry[];
    sectionHeaderEntries: ElfSectionHeaderEntry[];
}

export interface ElfProgramHeaderEntry {
    index: number;
    type: ProgramHeaderEntryType;
    typeDescription: string;
    flags: number;
    flagsDescription: string;
    offset: number;
    vaddr: number;
    paddr: number;
    filesz: number;
    memsz: number;
    align: number;
}

export interface ElfSectionHeaderEntry {
    index: number;
    nameix: number;
    name: string;
    type: SectionHeaderEntryType;
    typeDescription: string;
    flags: number;
    flagsDescription: string;
    addr: number;
    offset: number;
    size: number;
    link: number;
    info: number;
    addralign: number;
    entsize: number;
    strings?: { [index: number]: string };
    symbols?: ElfSymbol[];
}

export interface ElfSymbol {
    nameix: number;
    name: string;
    value: number;
    size: number;
    info: number;
    type: number;
    typeDescription: string;
    binding: number;
    bindingDescription: string;
    other: number;
    visibility: number;
    visibilityDescription: string;
    shndx: number;
    shndxDescription: string;
}

async function readProgramHeaderEntries(fh: fs.promises.FileHandle,
    ph_off: number | BigInt, ph_entsize: number, ph_num: number,
    bits: number, bigEndian: boolean): Promise<ElfProgramHeaderEntry[]> {

    if (ph_num == 0) {
        return [];
    }

    const buff = Buffer.alloc(ph_entsize);
    const readUInt32 = (bigEndian ? Buffer.prototype.readUInt32BE : Buffer.prototype.readUInt32LE).bind(buff);
    const readUInt64 = (bigEndian ? Buffer.prototype.readBigUInt64BE : Buffer.prototype.readBigUInt64LE).bind(buff);

    const result = new Array(ph_num);

    for (let i = 0; i < ph_num; i++) {
        await fh.read(buff, 0, ph_entsize, (ph_off as number) + i * ph_entsize);
        const type = readUInt32(0);

        let ix = 4;
        let flags, offset, vaddr, paddr, filesz, memsz, align;
        if (bits == 32) {
            offset = readUInt32(ix); ix += 4;
            vaddr = readUInt32(ix); ix += 4;
            paddr = readUInt32(ix); ix += 4;
            filesz = readUInt32(ix); ix += 4;
            memsz = readUInt32(ix); ix += 4;
            flags = readUInt32(ix); ix += 4;
            align = readUInt32(ix); ix += 4;
        } else {
            flags = readUInt32(ix); ix += 4;
            offset = readUInt64(ix); ix += 8;
            vaddr = readUInt64(ix); ix += 8;
            paddr = readUInt64(ix); ix += 8;
            filesz = readUInt64(ix); ix += 8;
            memsz = readUInt64(ix); ix += 8;
            align = readUInt64(ix); ix += 8;
        }

        result[i] = {
            index: i,
            type,
            typeDescription: ProgramHeaderEntryTypeToString(type),
            flags,
            flagsDescription: programHeaderFlagsToString(flags),
            offset,
            vaddr,
            paddr,
            filesz,
            memsz,
            align
        }
    }

    return result;
}

async function readStringSection(fh: fs.promises.FileHandle, offset: number, size: number): Promise<{ [index: number]: string }> {
    const tmp = Buffer.alloc(size);
    await fh.read(tmp, 0, size, offset);
    let ix = 0;
    const strings: {
        [index: number]: string;
    } = {};
    for (let i = 0; i < size; i++) {
        if (tmp[i] == 0) {
            const slen = i - ix;
            if (slen > 0) {
                strings[ix] = tmp.toString('utf8', ix, i);
            }
            ix = i + 1;
        }
    }
    return strings;
}

async function readSymbolsSection(fh: fs.promises.FileHandle, offset: number, size: number, entsize: number, bigEndian: boolean, bits: number): Promise<ElfSymbol[]> {

    const tmp = Buffer.alloc(entsize);
    const readUint8 = Buffer.prototype.readUInt8.bind(tmp);
    const readUInt16 = (bigEndian ? Buffer.prototype.readUInt16BE : Buffer.prototype.readUInt16LE).bind(tmp);
    const readUInt32 = (bigEndian ? Buffer.prototype.readUInt32BE : Buffer.prototype.readUInt32LE).bind(tmp);
    const readUInt64 = (bigEndian ? Buffer.prototype.readBigUInt64BE : Buffer.prototype.readBigUInt64LE).bind(tmp);

    const num = size / entsize;
    let ix = 0;
    const symbols: ElfSymbol[] = [];
    for (let i = 0; i < num; i++) {
        await fh.read(tmp, 0, entsize, offset + i * entsize);
        let ix = 0;

        let name, info, other, shndx, value, size;
        if (bits == 32) {
            name = readUInt32(ix); ix += 4;
            value = readUInt32(ix); ix += 4;
            size = readUInt32(ix); ix += 4;
            info = readUint8(ix); ix += 1;
            other = readUint8(ix); ix += 1;
            shndx = readUInt16(ix); ix += 2;
        }
        else {
            name = readUInt32(ix); ix += 4;
            info = readUint8(ix); ix += 1;
            other = readUint8(ix); ix += 1;
            shndx = readUInt16(ix); ix += 2;
            value = Number(readUInt64(ix)); ix += 8;
            size = Number(readUInt64(ix)); ix += 8;
        }
        const type = info & 0xf;
        const binding = info >> 4;
        const visibility = other & 3;

        symbols[i] = {
            nameix: name,
            name: "",
            info,
            other,
            shndx,
            value,
            size,
            type,
            binding,
            visibility,
            typeDescription: symbolTypeToString(type),
            bindingDescription: symbolBindingToString(binding),
            visibilityDescription: symbolVisibilityToString(visibility),
            shndxDescription: shndxToString(shndx)
        };
    }

    return symbols;
}

function fillInSymbolNames(symbols: ElfSymbol[], strings?: { [index: number]: string; }) {
    if (!strings) return;

    for (let i = 0; i < symbols.length; i++) {
        symbols[i].name = strings[symbols[i].nameix] || "";
    }
}

async function readSectionHeaderEntries(fh: fs.promises.FileHandle,
    sh_off: number | BigInt, sh_entsize: number, sh_num: number,
    bits: number, bigEndian: boolean): Promise<ElfSectionHeaderEntry[]> {

    if (sh_num == 0) {
        return [];
    }

    const buff = Buffer.alloc(sh_entsize);
    const readUInt32 = (bigEndian ? Buffer.prototype.readUInt32BE : Buffer.prototype.readUInt32LE).bind(buff);
    const readUInt64 = (bigEndian ? Buffer.prototype.readBigUInt64BE : Buffer.prototype.readBigUInt64LE).bind(buff);

    const result: ElfSectionHeaderEntry[] = new Array(sh_num);

    for (let i = 0; i < sh_num; i++) {
        await fh.read(buff, 0, sh_entsize, (sh_off as number) + i * sh_entsize);

        const name = readUInt32(0);
        const type = readUInt32(4);

        let ix = 8;
        let flags, addr, offset, size, link, info, addralign, entsize;
        if (bits == 32) {
            flags = readUInt32(ix); ix += 4;
            addr = readUInt32(ix); ix += 4;
            offset = readUInt32(ix); ix += 4;
            size = readUInt32(ix); ix += 4;
            link = readUInt32(ix); ix += 4;
            info = readUInt32(ix); ix += 4;
            addralign = readUInt32(ix); ix += 4;
            entsize = readUInt32(ix); ix += 4;
        } else {
            flags = Number(readUInt64(ix)); ix += 4;
            addr = Number(readUInt64(ix)); ix += 4;
            offset = Number(readUInt64(ix)); ix += 4;
            size = Number(readUInt64(ix)); ix += 4;
            link = readUInt32(ix); ix += 4;
            info = readUInt32(ix); ix += 4;
            addralign = Number(readUInt64(ix)); ix += 4;
            entsize = Number(readUInt64(ix)); ix += 4;
        }

        const section: ElfSectionHeaderEntry = {
            index: i,
            name: "",
            nameix: name,
            type,
            typeDescription: SectionHeaderEntryTypeToString(type),
            flags,
            flagsDescription: sectionFlagsToString(flags),
            addr,
            offset,
            size,
            link,
            info,
            addralign,
            entsize
        }

        result[i] = section;
    }

    for (let i = 0; i < sh_num; i++) {
        const section = result[i];
        const { size, type, offset } = section;

        if (size < MAX_SECTION_LOAD_SIZE && type === SectionHeaderEntryType.StrTab) {
            section.strings = await readStringSection(fh, offset, size);
        }
    }

    for (let i = 0; i < sh_num; i++) {
        const section = result[i];
        const { size, type, offset, entsize, link } = section;

        if (size < MAX_SECTION_LOAD_SIZE && type === SectionHeaderEntryType.SymTab) {
            section.symbols = await readSymbolsSection(fh, offset, size, entsize, bigEndian, bits);
            if (link >= 0 && link < result.length) {
                fillInSymbolNames(section.symbols, result[link].strings);
            }
        }
    }

    return result;
}

function fillInSectionHeaderNames(sections: ElfSectionHeaderEntry[], eSHStrNdx: number) {
    if (eSHStrNdx < sections.length) {
        const strs = sections[eSHStrNdx] && sections[eSHStrNdx].strings;
        if (strs) {
            sections.forEach(v => {
                if (v.nameix == 0) {
                    v.name = "<null>";
                } else {
                    const name = strs[v.nameix];
                    if (name) {
                        v.name = name;
                    }
                }
            });
        }
    }
}

export async function open(path: string): Promise<ElfOpenResult> {

    const result: ElfOpenResult = {
        success: false,
        errors: [],
        warnings: [],
        elf: null
    };

    let fh: fs.promises.FileHandle;

    try {
        fh = await fs.promises.open(path, "r");

        const { size } = await fh.stat();
        if (size <= 0x40) {
            result.errors.push("Not a valid ELF file. Too small.");
        } else {

            var eident = Buffer.alloc(16);
            await fh.read(eident, 0, 16);

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
                await fh.read(eheader, 0, sizeLeft);
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

                    const programHeaderEntries = await readProgramHeaderEntries(fh, ePHOff, ePHEntSize, ePHNum, bits, bigEndian);
                    const sectionHeaderEntries = await readSectionHeaderEntries(fh, eSHOff, eSHEntSize, eSHNum, bits, bigEndian);

                    fillInSectionHeaderNames(sectionHeaderEntries, eSHStrNdx);

                    result.elf = {
                        path,
                        bits,
                        abi,
                        abiDescription: ABIToString(abi),
                        isa,
                        isaDescription: ISAToString(isa),
                        type,
                        typeDescription: ObjectTypeToString(type),
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
    if (fh) {
        try {
            await fh.close();
        } catch (e) {
            result.errors.push(`Exception caught: ${e.toString()}`);
        }
    }

    return result;
}
