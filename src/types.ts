
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
    ProgramHeaderTable = 0x06,
    GnuEhFrame = 0x6474E550,
    GnuStack = 0x6474E551,
    GnuRelRo = 0x6474E552
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

export interface ELFOpenResult {
    success: boolean;
    errors: string[];
    warnings: string[];
    elf: ELF;
}

export interface ELF {
    path: string;
    class: number;
    classDescription: string;
    data: number;
    dataDescription: string;
    version: number;
    bits: number;
    abi: ABI;
    abiDescription: string;
    abiVersion: number;
    type: ObjectType;
    typeDescription: string;
    isa: ISA;
    isaDescription: string;
    isaVersion: number;
    flags: number;
    flagsDescription: string;
    entryPoint: number | BigInt;
    programHeaderOffset: number | BigInt;
    sectionHeaderOffset: number | BigInt;
    programHeaderEntrySize: number;
    numProgramHeaderEntries: number;
    sectionHeaderEntrySize: number;
    numSectionHeaderEntries: number;
    shstrIndex: number;
    segments: ELFProgramHeaderEntry[];
    sections: ELFSectionHeaderEntry[];
    
    getSymbols(): ELFSymbol[];
    getSymbolsInSection(sectionOrIndex: ELFSectionHeaderEntry | number): ELFSymbol[];
    getSymbolsInSegment(segmentOrIndex: ELFProgramHeaderEntry | number): ELFSymbol[];
    getSectionsInSegment(segmentOrIndex: ELFProgramHeaderEntry | number): ELFSectionHeaderEntry[];
    getSectionForSymbol(symbol: ELFSymbol): ELFSectionHeaderEntry;
    getSectionsForSymbol(symbol: ELFSymbol): ELFSectionHeaderEntry[];
    getSegmentForSymbol(symbol: ELFSymbol): ELFProgramHeaderEntry;
    getSegmentsForSymbol(symbol: ELFSymbol): ELFProgramHeaderEntry[];
    getSymbolsAtVirtualMemoryLocation(location: number | BigInt): ELFSymbol[];
    getSymbolsAtPhysicalMemoryLocation(location: number | BigInt): ELFSymbol[];
    getSectionsAtVirtualMemoryLocation(location: number | BigInt): ELFSectionHeaderEntry[];
    getSectionsAtPhysicalMemoryLocation(location: number | BigInt): ELFSectionHeaderEntry[];
    getSegmentsAtVirtualMemoryLocation(location: number | BigInt): ELFProgramHeaderEntry[];
    getSegmentsAtPhysicalMemoryLocation(location: number | BigInt): ELFProgramHeaderEntry[];
    virtualAddressToPhysical(location: number | BigInt): number | BigInt;
    virtualAddressToFileOffset(location: number | BigInt): number | BigInt;
    physicalAddressToVirtual(location: number | BigInt): number | BigInt;
    physicalAddressToFileOffset(location: number | BigInt): number | BigInt;
    fileOffsetToPhysicalAddress(location: number | BigInt): number | BigInt;
    fileOffsetToVirtualAddress(location: number | BigInt): number | BigInt;
    getSectionByName(sectionName: string): ELFSectionHeaderEntry;
    getSectionsByName(sectionName: string): ELFSectionHeaderEntry[];
    getSymbolByName(symbolName: string): ELFSymbol;
    getSymbolsByName(symbolName: string): ELFSymbol[];
    getSymbolVirtualAddress(symbol: ELFSymbol): number | BigInt;
    getSymbolPhysicalAddress(symbol: ELFSymbol): number | BigInt;
    getSymbolFileOffset(symbol: ELFSymbol): number | BigInt;
}

export interface ELFProgramHeaderEntry {
    index: number;
    type: ProgramHeaderEntryType;
    typeDescription: string;
    flags: number;
    flagsDescription: string;
    offset: number | BigInt;
    vaddr: number | BigInt;
    paddr: number | BigInt;
    filesz: number | BigInt;
    memsz: number | BigInt;
    align: number | BigInt;
}

export interface ELFSectionHeaderEntry {
    index: number;
    nameix: number;
    name: string;
    type: SectionHeaderEntryType;
    typeDescription: string;
    flags: number | BigInt;
    flagsDescription: string;
    addr: number | BigInt;
    offset: number | BigInt;
    size: number | BigInt;
    link: number;
    info: number;
    addralign: number | BigInt;
    entsize: number | BigInt;
    strings?: { [index: number]: string };
    symbols?: ELFSymbol[];
}

export interface ELFSymbol {
    nameix: number;
    name: string;
    value: number | BigInt;
    size: number | BigInt;
    info: number;
    type: SymbolType;
    typeDescription: string;
    binding: SymbolBinding;
    bindingDescription: string;
    other: number;
    visibility: SymbolVisibility;
    visibilityDescription: string;
    shndx: number;
    shndxDescription: string;
}