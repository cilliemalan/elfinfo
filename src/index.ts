import * as fs from "fs";

const MAX_SECTION_LOAD_SIZE = 0x1000000;

export enum ISA {
    None = 0x00,
    SPARC = 0x02,
    x86 = 0x03,
    MIPS = 0x08,
    PowerPC = 0x14,
    S390 = 0x16,
    ARM = 0x28,
    SuperH = 0x2A,
    IA64 = 0x32,
    x64 = 0x3E,
    AArch4 = 0xB7,
    RiscV = 0xF3
}

export enum ABI {
    SystemV = 0x00,
    HPUX = 0x01,
    NetBSD = 0x02,
    Linux = 0x03,
    GNUHurd = 0x04,
    Solaris = 0x06,
    AIX = 0x07,
    IRIX = 0x08,
    FreeBSD = 0x09,
    Tru64 = 0x0A,
    NovelloModesto = 0x0B,
    OpenBSD = 0x0C,
    OpenVMS = 0x0D,
    NonStopKernel = 0x0E,
    AROS = 0x0F,
    FenixOS = 0x10,
    CloudABI = 0x11,
    ARM = 0x61,
    Standalone = 0xff,
}

export enum ObjectType {
    None = 0x00,
    Relocatable = 0x01,
    Executable = 0x02,
    Shared = 0x03,
    Core = 0x04,
}

export enum ProgramHeaderEntryType {
    Null = 0x00,
    Load = 0x01,
    Dynamic = 0x02,
    Interp = 0x03,
    Note = 0x04,
    ShLib = 0x05,
    ProgramHeaderTable = 0x06
}

export enum SectionHeaderEntryType {
    // Inactive section with undefined values
    Null = 0,
    // Information defined by the program, includes executable code and data
    ProgBits = 1,
    // Section data contains a symbol table
    SymTab = 2,
    // Section data contains a string table
    StrTab = 3,
    // Section data contains relocation entries with explicit addends
    Rela = 4,
    // Section data contains a symbol hash table. Must be present for dynamic linking
    Hash = 5,
    // Section data contains information for dynamic linking
    Dynamic = 6,
    // Section data contains information that marks the file in some way
    Note = 7,
    // Section data occupies no space in the file but otherwise resembles SHT_PROGBITS
    NoBits = 8,
    // Section data contains relocation entries without explicit addends
    Rel = 9,
    // Section is reserved but has unspecified semantics
    ShLib = 10,
    // Section data contains a minimal set of dynamic linking symbols
    DynSym = 11,
    // Section data contains an array of constructors
    InitArray = 14,
    // Section data contains an array of destructors
    FiniArray = 15,
    // Section data contains an array of pre-constructors
    PreInitArray = 16,
    // Section group
    Group = 17,
    // Extended symbol table section index
    ShNdx = 18,
    // Number of reserved SHT_* values
    Num = 19,
    // Object attributes
    GnuAttributes = 0x6ffffff5,
    // GNU-style hash section
    GnuHash = 0x6ffffff6,
    // Pre-link library list
    GnuLibList = 0x6ffffff7,
    // Version definition section
    GnuVerDef = 0x6ffffffd,
    // Version needs section
    GnuVerNeed = 0x6ffffffe,
    // Version symbol table
    GnuVerSym = 0x6fffffff,
}

export enum SymbolType {
    None = 0,
    Object = 1,
    Function = 2,
    Section = 3,
    File = 4,
    Common = 5,
    ThreadLocalStorage = 6,
    RelocationExpression = 7,
    SignedRelocationExpression = 8
}

export enum SymbolBinding {
    Local = 0,
    Global = 1,
    Weak = 2
}

export enum SymbolVisibility {
    Default = 0,
    Internal = 1,
    Hidden = 2,
    Protected = 3
}

function ISAToString(isa: ISA): string {
    switch (isa) {
        case ISA.IA64: return 'IA-64';
        case ISA.RiscV: return 'RISC-V';
        default:
            return ISA[isa] || isa.toString();
    }
}

function ABIToString(abi: ABI): string {
    switch (abi) {
        case ABI.GNUHurd: return 'GNU Hurd';
        case ABI.NovelloModesto: return 'Novello Modesto';
        case ABI.HPUX: return 'HP-UX';
        case ABI.NonStopKernel: return 'NonStop Kernel';
        case ABI.FenixOS: return 'Fenix OS';
        default:
            return ABI[abi] || abi.toString();
    }
}

function ObjectTypeToString(objectType: ObjectType): string {
    return ObjectType[objectType] || objectType.toString();
}

function ProgramHeaderEntryTypeToString(programHeaderEntryType: ProgramHeaderEntryType): string {
    switch (programHeaderEntryType) {
        case ProgramHeaderEntryType.ProgramHeaderTable:
            return 'Program Header Table';
        default:
            return ProgramHeaderEntryType[programHeaderEntryType] || programHeaderEntryType.toString();
    }
}

function SectionHeaderEntryTypeToString(sectionHeaderEntryType: SectionHeaderEntryType): string {
    switch (sectionHeaderEntryType) {
        case SectionHeaderEntryType.Null: return 'NULL section';
        case SectionHeaderEntryType.ProgBits: return 'Prog bits';
        case SectionHeaderEntryType.SymTab: return 'Symbol table';
        case SectionHeaderEntryType.StrTab: return 'String table';
        case SectionHeaderEntryType.Rela: return 'Relocation section with addends';
        case SectionHeaderEntryType.Hash: return 'Symbol hash table';
        case SectionHeaderEntryType.Dynamic: return 'Dynamic';
        case SectionHeaderEntryType.Note: return 'Note';
        case SectionHeaderEntryType.NoBits: return 'No bits';
        case SectionHeaderEntryType.Rel: return 'Relocation section';
        case SectionHeaderEntryType.ShLib: return 'ShLib';
        case SectionHeaderEntryType.DynSym: return 'Dynamic linking symbols section';
        case SectionHeaderEntryType.InitArray: return 'Init array';
        case SectionHeaderEntryType.FiniArray: return 'Fini array';
        case SectionHeaderEntryType.PreInitArray: return 'Pre-init array';
        case SectionHeaderEntryType.Group: return 'Section group';
        case SectionHeaderEntryType.ShNdx: return 'Extended symbol table section index';
        case SectionHeaderEntryType.Num: return 'Num section';
        case SectionHeaderEntryType.GnuAttributes: return 'GNU object attributes';
        case SectionHeaderEntryType.GnuHash: return 'GNU hash section';
        case SectionHeaderEntryType.GnuLibList: return 'GNU pre-link library list';
        case SectionHeaderEntryType.GnuVerDef: return 'GNU version definition section';
        case SectionHeaderEntryType.GnuVerNeed: return 'GNU version needs section';
        case SectionHeaderEntryType.GnuVerSym: return 'GNU version symbol table';
        default:
            return SectionHeaderEntryType[sectionHeaderEntryType] || (sectionHeaderEntryType as number).toString();
    }
}

function sectionFlagsToString(flags: number | BigInt) {
    if (flags instanceof BigInt) {
        flags = Number(flags);
    }

    let str = [];
    if (flags & 0x1) str.push('Writeable');
    if (flags & 0x2) str.push('Alloc');
    if (flags & 0x4) str.push('Executable');
    if (flags & 0x10) str.push('Merge');
    if (flags & 0x20) str.push('Strings');
    if (flags & 0x40) str.push('Info Link');
    if (flags & 0x80) str.push('Link Order');
    if (flags & 0x100) str.push('Nonconforming');
    if (flags & 0x200) str.push('Group');
    if (flags & 0x400) str.push('Thread Local Storage');
    if (flags & 0x4000000) str.push('Special ordering');
    if (flags & 0x8000000) str.push('Exclude');
    if (str.length == 0) return '<none>';
    return str.join(' | ');
}

function programHeaderFlagsToString(flags: number) {
    let str = [];
    if (flags & 0x2) str.push('Write');
    if (flags & 0x4) str.push('Read');
    if (flags & 0x1) str.push('Execute');
    return str.join(' | ');
}

function elfFlagsToString(isa: ISA, flags: number): string {
    if (isa === ISA.ARM) {
        const ver = ((flags & 0xff000000) >> 24);
        let str = [
            `Version: ${ver}`
        ];
        if (flags & 0x00800000) str.push('BE-8');
        if (ver <= 4 && flags & 0x00400000) str.push('Legacy');
        if (ver >= 5 && flags & 0x00000400) str.push('Hard Float');
        if (ver >= 5 && flags & 0x00000200) str.push('Soft Float');
        return str.join(' | ');
    }

    return flags.toString();
}

function symbolTypeToString(type: SymbolType) {
    switch (type) {
        case SymbolType.RelocationExpression: return "Relocation Expression";
        case SymbolType.SignedRelocationExpression: return "Signed Relocation Expression";
        case SymbolType.ThreadLocalStorage: return "Thread Local Storage";
        default: return SymbolType[type] || type.toString();
    }
}

function symbolBindingToString(binding: SymbolBinding) {
    return SymbolBinding[binding] || binding.toString();
}

function symbolVisibilityToString(visibility: SymbolVisibility) {
    return SymbolVisibility[visibility] || visibility.toString();
}

function shndxToString(shndx: number) {
    if (shndx === 0) return 'Undefined';
    else if (shndx === 0xfffffff1) return 'Absolute';
    else if (shndx === 0xfffffff2) return 'Common';
    else return shndx.toString();
}

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

    try {
        const fh = await fs.promises.open(path, "r");

        const { size } = await fh.stat();
        if (size <= 0x40) {
            result.errors.push("Not a valid ELF file. Too small.");
        } else {

            var eident = Buffer.alloc(16);
            await fh.read(eident, 0, 16);

            const magic = 0x464c457f;
            if (eident.readInt32LE(0) !== magic) {
                result.warnings.push("Not a valid ELF file");
            }

            const eiClass = eident.readUInt8(4);
            const eiData = eident.readUInt8(5);
            const eiVer = eident.readUInt8(6);
            const eiAbi = eident.readUInt8(7);
            const eiAbiVer = eident.readUInt8(8);

            if (eiClass < 1 || eiClass > 2) {
                result.errors.push("Not a valid ELF file. Class was invalid");
            }

            if (eiData < 1 || eiData > 2) {
                result.errors.push("Not a valid ELF file. Endianness was invalid");
            }

            if (eiVer != 1) {
                result.warnings.push("Not a valid ELF file. Version was invalid");
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

                if (ePHOff < eHSize || ePHOff > size ||
                    eSHOff < eHSize || eSHOff > size) {
                    result.errors.push("Invalid ELF file. Invalid offsets");
                }

                if ((bits == 32 && ePHEntSize < 0x20) ||
                    (bits == 64 && ePHEntSize < 0x38) ||
                    (ePHEntSize > 0xff)) {
                    result.errors.push("Invalid ELF file. Program header entry size invalid");
                }

                if ((bits == 32 && eSHEntSize < 0x28) ||
                    (bits == 64 && eSHEntSize < 0x40) ||
                    (ePHEntSize > 0xff)) {
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

    if (!result.elf && result.errors.length == 0) {
        result.errors.push('Unspecified error');
    }

    return result;
}
