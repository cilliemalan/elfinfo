/**
 * The type of Instruction Set Architecture.
 */
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

/**
 * The type of Application Binary Interface.
 */
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

/**
 * The type of ELF file. executables are ELF files,
 * but some other files (like .o files or .so files)
 * are also ELF files of different types.
 */
export enum ObjectType {
    None = 0x00,
    Relocatable = 0x01,
    Executable = 0x02,
    Shared = 0x03,
    Core = 0x04,
}

/**
 * The type of a segment (program header entry).
 */
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

/**
 * The type of section.
 */
export enum SectionHeaderEntryType {
    /** Inactive section with undefined values */
    Null = 0,
    /** Information defined by the program, includes executable code and data */
    ProgBits = 1,
    /** Section data contains a symbol table */
    SymTab = 2,
    /** Section data contains a string table */
    StrTab = 3,
    /** Section data contains relocation entries with explicit addends */
    Rela = 4,
    /** Section data contains a symbol hash table. Must be present for dynamic linking */
    Hash = 5,
    /** Section data contains information for dynamic linking */
    Dynamic = 6,
    /** Section data contains information that marks the file in some way */
    Note = 7,
    /** Section data occupies no space in the file but otherwise resembles SHT_PROGBITS */
    NoBits = 8,
    /** Section data contains relocation entries without explicit addends */
    Rel = 9,
    /** Section is reserved but has unspecified semantics */
    ShLib = 10,
    /** Section data contains a minimal set of dynamic linking symbols */
    DynSym = 11,
    /** Section data contains an array of constructors */
    InitArray = 14,
    /** Section data contains an array of destructors */
    FiniArray = 15,
    /** Section data contains an array of pre-constructors */
    PreInitArray = 16,
    /** Section group */
    Group = 17,
    /** Extended symbol table section index */
    ShNdx = 18,
    /** Number of reserved SHT_* values */
    Num = 19,
    /** Object attributes */
    GnuAttributes = 0x6ffffff5,
    /** GNU-style hash section */
    GnuHash = 0x6ffffff6,
    /** Pre-link library list */
    GnuLibList = 0x6ffffff7,
    /** Version definition section */
    GnuVerDef = 0x6ffffffd,
    /** Version needs section */
    GnuVerNeed = 0x6ffffffe,
    /** Version symbol table */
    GnuVerSym = 0x6fffffff,
}

/**
 * The type of symbol. The most common symbol is a function or object,
 * but other kinds of symbols exist for keeping track of various things.
 */
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

/**
 * The scope of the symbol.
 */
export enum SymbolBinding {
    /** A local symbol is akin to a local variable. */
    Local = 0,
    /** A global symbol is akin to a global variable or function. */
    Global = 1,
    /** A weak symbol is a symbol that can be replaced by a non-weak symbol in another object file when linking. */
    Weak = 2
}

/**
 * The visibility of a symbol.
 */
export enum SymbolVisibility {
    Default = 0,
    Internal = 1,
    Hidden = 2,
    Protected = 3
}

export interface ELF {
    /** The path of the file. Only set when parse was called with a path. */
    path?: string;
    /** The class (or bit-ness) of the ELF file. There are two classes of ELF files: 32-bit and 64-bit. */
    class: number;
    /** A human readable description of class.  */
    classDescription: string;
    /** The endianness of the data in the ELF file. */
    data: number;
    /** A human readable description of data. */
    dataDescription: string;
    /** The version of the ELF file. There is currently only one version. */
    version: number;
    /** Numberical number of bits with respect to class. Either 32 or 64. */
    bits: number;
    /** The ABI (Application Binary Interface) of this ELF file. This is typically not used and set to SystemV.  */
    abi: ABI;
    /** A human readable description of abi. */
    abiDescription: string;
    /** The ABI version. This is ABI specific data but is generally not used. */
    abiVersion: number;
    /** The type of ELF file this is (e.g. executable, object file, shared library). */
    type: ObjectType;
    /** A human readable description of type. */
    typeDescription: string;
    /** The ISA (Instruction Set Architecture) for this ELF file. This corresponds to the type of processor this ELF file is for
     * and does not necessarily include the entire specification of the ISA. isaVersion and flags may contain more information. */
    isa: ISA;
    /** A human readable description of isa. */
    isaDescription: string;
    /** The version of ISA used. The interpretation of version is ISA specific. */
    isaVersion: number;
    /** Flags for the ISA used. The interpretation is ISA specific. */
    flags: number;
    /** A human readable description of flags. */
    flagsDescription: string;
    /** The virtual address of the entypoint. */
    entryPoint: number | BigInt;
    /** Offset in the ELF file of the first program header entry. */
    programHeaderOffset: number | BigInt;
    /** Offset in the ELF file of the first section header entyr. */
    sectionHeaderOffset: number | BigInt;
    /** The size of one program header entry. */
    programHeaderEntrySize: number;
    /** The total number of program header entries in the file. */
    numProgramHeaderEntries: number;
    /** The size of one section header entry. */
    sectionHeaderEntrySize: number;
    /** The total number of program section entries in the file. */
    numSectionHeaderEntries: number;
    /** The section index for the string table (if any). */
    shstrIndex: number;
    /** The segments for the ELF file, parsed from program header entries. */
    segments: ELFProgramHeaderEntry[];
    /** The sections for the ELF file, parsed from section header entries. */
    sections: ELFSectionHeaderEntry[];
}

/**
 * The result of parsing an ELF file. The goods
 * are in the elf property.
 */
export interface ELFOpenResult {
    /** Whether or not the parse was a success. On failure, errors will be populated. */
    success: boolean;
    /** Any errors that happened during parsing. If there are any errors, elf will not be set. */
    errors: string[];
    /** Any warnings that occurred during parsing. */
    warnings: string[];
    /** The information parsed from the ELF file. */
    elf?: ELF;
}

/**
 * A segment, parsed from the ELF file program header entries. 
 */
export interface ELFProgramHeaderEntry {
    /** The index of this segment, as parsed. */
    index: number;
    /** The type of this segment. */
    type: ProgramHeaderEntryType;
    /** A human readable description of type. */
    typeDescription: string;
    /** Flags for this segment */
    flags: number;
    /** A human readable description of flags. */
    flagsDescription: string;
    /** The file offset for data for this segment. */
    offset: number | BigInt;
    /** The virtual address for this segment. Also called the VMA address. */
    vaddr: number | BigInt;
    /** The physical address for this segment. Also called the LMA or load address. */
    paddr: number | BigInt;
    /** The size of this segment in the ELF file */
    filesz: number | BigInt;
    /** The size of this segment in (virtual) memory. */
    memsz: number | BigInt;
    /** The alignment of this segment (the segment must be loaded to an address in multiples of this). */
    align: number | BigInt;
}

/** 
 * A section, parsed from the ELF file program header entries. 
 */
export interface ELFSectionHeaderEntry {
    /** The index of this section, as parsed. */
    index: number;
    /** The index for the name for this section in the global string table. */
    nameix: number;
    /** The name of this section, copied from a string table. */
    name: string;
    /** The type of this section. */
    type: SectionHeaderEntryType;
    /** A human readable description of type. */
    typeDescription: string;
    /** The flags for this section. */
    flags: number | BigInt;
    /** A human readable description of flags. */
    flagsDescription: string;
    /** The (virtual) address of this section. */
    addr: number | BigInt;
    /** The offset of this section. */
    offset: number | BigInt;
    /** The size of this section. */
    size: number | BigInt;
    /** A section linked to this section. For example for a symbol section the 
     * linked section is a string table section providing names for symbols. 
     */
    link: number;
    /** Section type specific info for this section. */
    info: number;
    /** The alignment requirement of this section. */
    addralign: number | BigInt;
    /** The size of each entity in this section. For example, if this is a symbol
     * table section this is the size of a symbol entry.
     */
    entsize: number | BigInt;
    /** The strings parsed from this section in the case of a string table section.  */
    strings?: { [index: number]: string };
    /** The symbols parsed from this section in the case of a symbol table section. */
    symbols?: ELFSymbol[];
}

/** 
 * A symbol, parsed from a symbol table. 
 */
export interface ELFSymbol {
    /** The index in the associated string table for the symbol. */
    nameix: number;
    /** The name as copied from the string table. */
    name: string;
    /** The value (address) of this symbol in (virtual) memory, if applicable. */
    value: number | BigInt;
    /** The size of this symbol, if applicable. */
    size: number | BigInt;
    /** Symbol type specific information. */
    info: number;
    /** The type of this symbol */
    type: SymbolType;
    /** A human readable description of type. */
    typeDescription: string;
    /** THe binding type of this symbol */
    binding: SymbolBinding;
    /** A human readable description of binding. */
    bindingDescription: string;
    /** Other symbol information. */
    other: number;
    /** The visibility of the symbol. */
    visibility: SymbolVisibility;
    /** A human readable description of visibility. */
    visibilityDescription: string;
    /** SHNDX for this symbol. */
    shndx: number;
    /** A human readable description of shndx. */
    shndxDescription: string;
    /** The data for the symbol, if any and if it was specified to be loaded */
    data?: Uint8Array;
}