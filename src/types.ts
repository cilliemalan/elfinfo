/**
 * The type of Instruction Set Architecture.
 */
export enum ISA {
    None = 0,
    M32 = 1,
    SPARC = 2,
    x86 = 3,
    ISA68K = 4,
    ISA88K = 5,
    IAMCU = 6,
    ISA860 = 7,
    MIPS = 8,
    S370 = 9,
    MIPS_RS3_LE = 10,
    PARISC = 15,
    VPP500 = 17,
    SPARC32PLUS = 18,
    ISA960 = 19,
    PPC = 20,
    PPC64 = 21,
    S390 = 22,
    SPU = 23,
    V800 = 36,
    FR20 = 37,
    RH32 = 38,
    RCE = 39,
    ARM = 40,
    FAKE_ALPHA = 41,
    SH = 42,
    SPARCV9 = 43,
    TRICORE = 44,
    ARC = 45,
    H8_300 = 46,
    H8_300H = 47,
    H8S = 48,
    H8_500 = 49,
    IA_64 = 50,
    MIPS_X = 51,
    COLDFIRE = 52,
    ISA68HC12 = 53,
    MMA = 54,
    PCP = 55,
    NCPU = 56,
    NDR1 = 57,
    STARCORE = 58,
    ME16 = 59,
    ST100 = 60,
    TINYJ = 61,
    X86_64 = 62,
    PDSP = 63,
    PDP10 = 64,
    PDP11 = 65,
    FX66 = 66,
    ST9PLUS = 67,
    ST7 = 68,
    ISA68HC16 = 69,
    ISA68HC11 = 70,
    ISA68HC08 = 71,
    ISA68HC05 = 72,
    SVX = 73,
    ST19 = 74,
    VAX = 75,
    CRIS = 76,
    JAVELIN = 77,
    FIREPATH = 78,
    ZSP = 79,
    MMIX = 80,
    HUANY = 81,
    PRISM = 82,
    AVR = 83,
    FR30 = 84,
    D10V = 85,
    D30V = 86,
    V850 = 87,
    M32R = 88,
    MN10300 = 89,
    MN10200 = 90,
    PJ = 91,
    OPENRISC = 92,
    ARC_COMPACT = 93,
    XTENSA = 94,
    VIDEOCORE = 95,
    TMM_GPP = 96,
    NS32K = 97,
    TPC = 98,
    SNP1K = 99,
    ST200 = 100,
    IP2K = 101,
    MAX = 102,
    CR = 103,
    F2MC16 = 104,
    MSP430 = 105,
    BLACKFIN = 106,
    SE_C33 = 107,
    SEP = 108,
    ARCA = 109,
    UNICORE = 110,
    EXCESS = 111,
    DXP = 112,
    ALTERA_NIOS2 = 113,
    CRX = 114,
    XGATE = 115,
    C166 = 116,
    M16C = 117,
    DSPIC30F = 118,
    CE = 119,
    M32C = 120,
    TSK3000 = 131,
    RS08 = 132,
    SHARC = 133,
    ECOG2 = 134,
    SCORE7 = 135,
    DSP24 = 136,
    VIDEOCORE3 = 137,
    LATTICEMICO32 = 138,
    SE_C17 = 139,
    TI_C6000 = 140,
    TI_C2000 = 141,
    TI_C5500 = 142,
    TI_ARP32 = 143,
    TI_PRU = 144,
    MMDSP_PLUS = 160,
    CYPRESS_M8C = 161,
    R32C = 162,
    TRIMEDIA = 163,
    QDSP6 = 164,
    ISA8051 = 165,
    STXP7X = 166,
    NDS32 = 167,
    ECOG1X = 168,
    MAXQ30 = 169,
    XIMO16 = 170,
    MANIK = 171,
    CRAYNV2 = 172,
    RX = 173,
    METAG = 174,
    MCST_ELBRUS = 175,
    ECOG16 = 176,
    CR16 = 177,
    ETPU = 178,
    SLE9X = 179,
    L10M = 180,
    K10M = 181,
    AARCH64 = 183,
    AVR32 = 185,
    STM8 = 186,
    TILE64 = 187,
    TILEPRO = 188,
    MICROBLAZE = 189,
    CUDA = 190,
    TILEGX = 191,
    CLOUDSHIELD = 192,
    COREA_1ST = 193,
    COREA_2ND = 194,
    ARC_COMPACT2 = 195,
    OPEN8 = 196,
    RL78 = 197,
    VIDEOCORE5 = 198,
    ISA78KOR = 199,
    ISA56800EX = 200,
    BA1 = 201,
    BA2 = 202,
    XCORE = 203,
    MCHP_PIC = 204,
    KM32 = 210,
    KMX32 = 211,
    EMX16 = 212,
    EMX8 = 213,
    KVARC = 214,
    CDP = 215,
    COGE = 216,
    COOL = 217,
    NORC = 218,
    CSR_KALIMBA = 219,
    Z80 = 220,
    VISIUM = 221,
    FT32 = 222,
    MOXIE = 223,
    AMDGPU = 224,
    RISCV = 243,
    BPF = 247,
    CSKY = 252
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
    ARMEABI = 0x40,
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
    entryPoint: number | bigint;
    /** Offset in the ELF file of the first program header entry. */
    programHeaderOffset: number;
    /** Offset in the ELF file of the first section header entyr. */
    sectionHeaderOffset: number;
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
    segments: ELFSegment[];
    /** The sections for the ELF file, parsed from section header entries. */
    sections: ELFSection[];
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
export interface ELFSegment {
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
    offset: number;
    /** The virtual address for this segment. Also called the VMA address. */
    vaddr: number | bigint;
    /** The physical address for this segment. Also called the LMA or load address. */
    paddr: number | bigint;
    /** The size of this segment in the ELF file */
    filesz: number;
    /** The size of this segment in (virtual) memory. */
    memsz: number;
    /** The alignment of this segment (the segment must be loaded to an address in multiples of this). */
    align: number;
}

/** 
 * A section, parsed from the ELF file program header entries. 
 */
export interface ELFSection {
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
    flags: number;
    /** A human readable description of flags. */
    flagsDescription: string;
    /** The (virtual) address of this section. */
    addr: number | bigint;
    /** The offset of this section. */
    offset: number;
    /** The size of this section. */
    size: number;
    /** A section linked to this section. For example for a symbol section the 
     * linked section is a string table section providing names for symbols. 
     */
    link: number;
    /** Section type specific info for this section. */
    info: number;
    /** The alignment requirement of this section. */
    addralign: number;
    /** The size of each entity in this section. For example, if this is a symbol
     * table section this is the size of a symbol entry.
     */
    entsize: number;
}

/** A string table section. */
export interface ELFStringSection extends ELFSection {
    /** The strings parsed from this section in the case of a string table section.  */
    strings: { [index: number]: string };
}

/** A symbol table section. */
export interface ELFSymbolSection extends ELFSection {
    /** The symbols parsed from this section. */
    symbols: ELFSymbol[];
}

/** A relocation table section. */
export interface ELFRelocationSection extends ELFSection {
    /** The relocations parsed from this section. */
    relocations: ELFRelocation[];
}

/** 
 * A symbol, parsed from a symbol table. 
 */
export interface ELFSymbol {
    /** The index in the associated string table for the symbol. */
    nameix: number;
    /** The name as copied from the string table. */
    name: string;
    /** The value of this symbol. The interpretation of the value is dependent on a few things but is generally an offset or address. */
    value: number | bigint;
    /** The size of this symbol, if applicable. */
    size: number;
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
    /** Section index for this symbol.
     * @summary This is the index of the section for this symbol. There
     * are also special values such as 0xfff1 for an absolute index symbol
     * in a relocatable ELF file (object file).
     */
    shndx: number;

    /** The calculated virtaul address for the symbol, if possible */
    virtualAddress?: number | bigint;
    /** The data for the symbol, if any and if it was specified to be loaded */
    data?: Uint8Array;
}

/**
 * A relocation as found in a relocation section.
 * @summary if the section is a Rel section, addend will be undefined. If
 * the section is a Rela section, addend will be set.
 */
export interface ELFRelocation {
    /**
     * The location at which to apply the relocation action.
     * @summary This member gives the location at which to apply the relocation action. For
     * a relocatable file, the value is the byte offset from the beginning of the
     * section to the storage unit affected by the relocation. For an executable file
     * or a shared object, the value is the virtual address of the storage unit affected
     * by the relocation.
     */
    addr: number | bigint;

    /**
     * The symbol table index with respect to which the
     * relocation must be made, and the type of relocation to apply.
     * @summary This member gives both the symbol table index with respect to which the
     * relocation must be made, and the type of relocation to apply. For example,
     * a call instruction's relocation entry would hold the symbol table index of
     * the function being called. If the index is STN_UNDEF, the undefined symbol
     * index, the relocation uses 0 as the "symbol value.'' Relocation types are
     * processor-specific; descriptions of their behavior appear in the processor
     * supplement. When the text in the processor supplement refers to a
     * relocation entry's relocation type or symbol table index, it means the result
     * of applying ELF32_R_TYPE or ELF32_R_SYM, respectively, to the
     * entry's r_info member.
     */
    info: number | bigint;

    /** A constant addend used to compute the value to be stored into the relocatable field. */
    addend?: number | bigint;

    /** the symbol index for this relocation.
     * @summary The symbol for this relocation
     * is found in the section identified by the
     * info field in the section this relocation
     * is found in.
     * The symbol index is taken from the info field.
     */
    symbolIndex: number;

    /** The type of this relocation.
     * @summary Relocation types are processor specific
     * so the raw number is given here.
     * The relocation type is take from the info field
     */
    type: number;

}