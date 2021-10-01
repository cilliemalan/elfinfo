import {
    ISA, ABI, ObjectType,
    ProgramHeaderEntryType, SectionHeaderEntryType,
    SymbolType, SymbolBinding, SymbolVisibility
} from './types';

export function isaToString(isa: ISA): string {
    switch (isa) {
        case ISA.None: return 'No machine';
        case ISA.M32: return 'AT&T WE 32100';
        case ISA.SPARC: return 'SUN SPARC';
        case ISA.x86: return 'Intel x86';
        case ISA.ISA68K: return 'Motorola m68k family';
        case ISA.ISA88K: return 'Motorola m88k family';
        case ISA.IAMCU: return 'Intel MCU';
        case ISA.ISA860: return 'Intel 80860';
        case ISA.MIPS: return 'MIPS R3000 big-endian';
        case ISA.S370: return 'IBM System/370';
        case ISA.MIPS_RS3_LE: return 'MIPS R3000 little-endian';
        case ISA.PARISC: return 'HPPA';
        case ISA.VPP500: return 'Fujitsu VPP500';
        case ISA.SPARC32PLUS: return 'Sun\'s "v8plus"';
        case ISA.ISA960: return 'Intel 80960';
        case ISA.PPC: return 'PowerPC';
        case ISA.PPC64: return 'PowerPC 64-bit';
        case ISA.S390: return 'IBM S390';
        case ISA.SPU: return 'IBM SPU/SPC';
        case ISA.V800: return 'NEC V800 series';
        case ISA.FR20: return 'Fujitsu FR20';
        case ISA.RH32: return 'TRW RH-32';
        case ISA.RCE: return 'Motorola RCE';
        case ISA.ARM: return 'ARM';
        case ISA.FAKE_ALPHA: return 'Digital Alpha';
        case ISA.SH: return 'Hitachi SH';
        case ISA.SPARCV9: return 'SPARC v9 64-bit';
        case ISA.TRICORE: return 'Siemens Tricore';
        case ISA.ARC: return 'Argonaut RISC Core';
        case ISA.H8_300: return 'Hitachi H8/300';
        case ISA.H8_300H: return 'Hitachi H8/300H';
        case ISA.H8S: return 'Hitachi H8S';
        case ISA.H8_500: return 'Hitachi H8/500';
        case ISA.IA_64: return 'Intel Merced';
        case ISA.MIPS_X: return 'Stanford MIPS-X';
        case ISA.COLDFIRE: return 'Motorola Coldfire';
        case ISA.ISA68HC12: return 'Motorola M68HC12';
        case ISA.MMA: return 'Fujitsu MMA Multimedia Accelerator';
        case ISA.PCP: return 'Siemens PCP';
        case ISA.NCPU: return 'Sony nCPU embeeded RISC';
        case ISA.NDR1: return 'Denso NDR1 microprocessor';
        case ISA.STARCORE: return 'Motorola Start*Core processor';
        case ISA.ME16: return 'Toyota ME16 processor';
        case ISA.ST100: return 'STMicroelectronic ST100 processor';
        case ISA.TINYJ: return 'Advanced Logic Corp. Tinyj emb.fam';
        case ISA.X86_64: return 'AMD x86-64 architecture';
        case ISA.PDSP: return 'Sony DSP Processor';
        case ISA.PDP10: return 'Digital PDP-10';
        case ISA.PDP11: return 'Digital PDP-11';
        case ISA.FX66: return 'Siemens FX66 microcontroller';
        case ISA.ST9PLUS: return 'STMicroelectronics ST9+ 8/16 mc';
        case ISA.ST7: return 'STmicroelectronics ST7 8 bit mc';
        case ISA.ISA68HC16: return 'Motorola MC68HC16 microcontroller';
        case ISA.ISA68HC11: return 'Motorola MC68HC11 microcontroller';
        case ISA.ISA68HC08: return 'Motorola MC68HC08 microcontroller';
        case ISA.ISA68HC05: return 'Motorola MC68HC05 microcontroller';
        case ISA.SVX: return 'Silicon Graphics SVx';
        case ISA.ST19: return 'STMicroelectronics ST19 8 bit mc';
        case ISA.VAX: return 'Digital VAX';
        case ISA.CRIS: return 'Axis Communications 32-bit emb.proc';
        case ISA.JAVELIN: return 'Infineon Technologies 32-bit emb.proc';
        case ISA.FIREPATH: return 'Element 14 64-bit DSP Processor';
        case ISA.ZSP: return 'LSI Logic 16-bit DSP Processor';
        case ISA.MMIX: return 'Donald Knuth\'s educational 64-bit proc';
        case ISA.HUANY: return 'Harvard University machine-independent object files';
        case ISA.PRISM: return 'SiTera Prism';
        case ISA.AVR: return 'Atmel AVR 8-bit microcontroller';
        case ISA.FR30: return 'Fujitsu FR30';
        case ISA.D10V: return 'Mitsubishi D10V';
        case ISA.D30V: return 'Mitsubishi D30V';
        case ISA.V850: return 'NEC v850';
        case ISA.M32R: return 'Mitsubishi M32R';
        case ISA.MN10300: return 'Matsushita MN10300';
        case ISA.MN10200: return 'Matsushita MN10200';
        case ISA.PJ: return 'picoJava';
        case ISA.OPENRISC: return 'OpenRISC 32-bit embedded processor';
        case ISA.ARC_COMPACT: return 'ARC International ARCompact';
        case ISA.XTENSA: return 'Tensilica Xtensa Architecture';
        case ISA.VIDEOCORE: return 'Alphamosaic VideoCore';
        case ISA.TMM_GPP: return 'Thompson Multimedia General Purpose Proc';
        case ISA.NS32K: return 'National Semi. 32000';
        case ISA.TPC: return 'Tenor Network TPC';
        case ISA.SNP1K: return 'Trebia SNP 1000';
        case ISA.ST200: return 'STMicroelectronics ST200';
        case ISA.IP2K: return 'Ubicom IP2xxx';
        case ISA.MAX: return 'MAX processor';
        case ISA.CR: return 'National Semi. CompactRISC';
        case ISA.F2MC16: return 'Fujitsu F2MC16';
        case ISA.MSP430: return 'Texas Instruments msp430';
        case ISA.BLACKFIN: return 'Analog Devices Blackfin DSP';
        case ISA.SE_C33: return 'Seiko Epson S1C33 family';
        case ISA.SEP: return 'Sharp embedded microprocessor';
        case ISA.ARCA: return 'Arca RISC';
        case ISA.UNICORE: return 'PKU-Unity & MPRC Peking Uni. mc series';
        case ISA.EXCESS: return 'eXcess configurable cpu';
        case ISA.DXP: return 'Icera Semi. Deep Execution Processor';
        case ISA.ALTERA_NIOS2: return 'Altera Nios II';
        case ISA.CRX: return 'National Semi. CompactRISC CRX';
        case ISA.XGATE: return 'Motorola XGATE';
        case ISA.C166: return 'Infineon C16x/XC16x';
        case ISA.M16C: return 'Renesas M16C';
        case ISA.DSPIC30F: return 'Microchip Technology dsPIC30F';
        case ISA.CE: return 'Freescale Communication Engine RISC';
        case ISA.M32C: return 'Renesas M32C';
        case ISA.TSK3000: return 'Altium TSK3000';
        case ISA.RS08: return 'Freescale RS08';
        case ISA.SHARC: return 'Analog Devices SHARC family';
        case ISA.ECOG2: return 'Cyan Technology eCOG2';
        case ISA.SCORE7: return 'Sunplus S+core7 RISC';
        case ISA.DSP24: return 'New Japan Radio (NJR) 24-bit DSP';
        case ISA.VIDEOCORE3: return 'Broadcom VideoCore III';
        case ISA.LATTICEMICO32: return 'RISC for Lattice FPGA';
        case ISA.SE_C17: return 'Seiko Epson C17';
        case ISA.TI_C6000: return 'Texas Instruments TMS320C6000 DSP';
        case ISA.TI_C2000: return 'Texas Instruments TMS320C2000 DSP';
        case ISA.TI_C5500: return 'Texas Instruments TMS320C55x DSP';
        case ISA.TI_ARP32: return 'Texas Instruments App. Specific RISC';
        case ISA.TI_PRU: return 'Texas Instruments Prog. Realtime Unit';
        case ISA.MMDSP_PLUS: return 'STMicroelectronics 64bit VLIW DSP';
        case ISA.CYPRESS_M8C: return 'Cypress M8C';
        case ISA.R32C: return 'Renesas R32C';
        case ISA.TRIMEDIA: return 'NXP Semi. TriMedia';
        case ISA.QDSP6: return 'QUALCOMM DSP6';
        case ISA.ISA8051: return 'Intel 8051 and variants';
        case ISA.STXP7X: return 'STMicroelectronics STxP7x';
        case ISA.NDS32: return 'Andes Tech. compact code emb. RISC';
        case ISA.ECOG1X: return 'Cyan Technology eCOG1X';
        case ISA.MAXQ30: return 'Dallas Semi. MAXQ30 mc';
        case ISA.XIMO16: return 'New Japan Radio (NJR) 16-bit DSP';
        case ISA.MANIK: return 'M2000 Reconfigurable RISC';
        case ISA.CRAYNV2: return 'Cray NV2 vector architecture';
        case ISA.RX: return 'Renesas RX';
        case ISA.METAG: return 'Imagination Tech. META';
        case ISA.MCST_ELBRUS: return 'MCST Elbrus';
        case ISA.ECOG16: return 'Cyan Technology eCOG16';
        case ISA.CR16: return 'National Semi. CompactRISC CR16';
        case ISA.ETPU: return 'Freescale Extended Time Processing Unit';
        case ISA.SLE9X: return 'Infineon Tech. SLE9X';
        case ISA.L10M: return 'Intel L10M';
        case ISA.K10M: return 'Intel K10M';
        case ISA.AARCH64: return 'ARM AARCH64';
        case ISA.AVR32: return 'Amtel 32-bit microprocessor';
        case ISA.STM8: return 'STMicroelectronics STM8';
        case ISA.TILE64: return 'Tileta TILE64';
        case ISA.TILEPRO: return 'Tilera TILEPro';
        case ISA.MICROBLAZE: return 'Xilinx MicroBlaze';
        case ISA.CUDA: return 'NVIDIA CUDA';
        case ISA.TILEGX: return 'Tilera TILE-Gx';
        case ISA.CLOUDSHIELD: return 'CloudShield';
        case ISA.COREA_1ST: return 'KIPO-KAIST Core-A 1st gen.';
        case ISA.COREA_2ND: return 'KIPO-KAIST Core-A 2nd gen.';
        case ISA.ARC_COMPACT2: return 'Synopsys ARCompact V2';
        case ISA.OPEN8: return 'Open8 RISC';
        case ISA.RL78: return 'Renesas RL78';
        case ISA.VIDEOCORE5: return 'Broadcom VideoCore V';
        case ISA.ISA78KOR: return 'Renesas 78KOR';
        case ISA.ISA56800EX: return 'Freescale 56800EX DSC';
        case ISA.BA1: return 'Beyond BA1';
        case ISA.BA2: return 'Beyond BA2';
        case ISA.XCORE: return 'XMOS xCORE';
        case ISA.MCHP_PIC: return 'Microchip 8-bit PIC(r)';
        case ISA.KM32: return 'KM211 KM32';
        case ISA.KMX32: return 'KM211 KMX32';
        case ISA.EMX16: return 'KM211 KMX16';
        case ISA.EMX8: return 'KM211 KMX8';
        case ISA.KVARC: return 'KM211 KVARC';
        case ISA.CDP: return 'Paneve CDP';
        case ISA.COGE: return 'Cognitive Smart Memory Processor';
        case ISA.COOL: return 'Bluechip CoolEngine';
        case ISA.NORC: return 'Nanoradio Optimized RISC';
        case ISA.CSR_KALIMBA: return 'CSR Kalimba';
        case ISA.Z80: return 'Zilog Z80';
        case ISA.VISIUM: return 'Controls and Data Services VISIUMcore';
        case ISA.FT32: return 'FTDI Chip FT32';
        case ISA.MOXIE: return 'Moxie processor';
        case ISA.AMDGPU: return 'AMD GPU';
        case ISA.RISCV: return 'RISC-V';
        case ISA.BPF: return 'Linux BPF';
        case ISA.CSKY: return 'C-SKY';
    }
}

export function abiToString(abi: ABI): string {
    switch (abi) {
        case ABI.GNUHurd: return 'GNU Hurd';
        case ABI.NovelloModesto: return 'Novello Modesto';
        case ABI.HPUX: return 'HP-UX';
        case ABI.NonStopKernel: return 'NonStop Kernel';
        case ABI.FenixOS: return 'Fenix OS';
        case ABI.ARMEABI: return 'ARM EABI';
        default:
            return ABI[abi] || abi.toString();
    }
}

export function objectTypeToString(objectType: ObjectType): string {
    return ObjectType[objectType] || objectType.toString();
}

export function programHeaderEntryTypeToString(programHeaderEntryType: ProgramHeaderEntryType): string {
    switch (programHeaderEntryType) {
        case ProgramHeaderEntryType.ProgramHeaderTable:
            return 'Program Header Table';
        case ProgramHeaderEntryType.GnuEhFrame:
            return 'GNU EH frame';
        case ProgramHeaderEntryType.GnuStack:
            return 'GNU stack info';
        case ProgramHeaderEntryType.GnuRelRo:
            return 'GNU ro relocation';
        default:
            return ProgramHeaderEntryType[programHeaderEntryType] || programHeaderEntryType.toString();
    }
}

export function sectionHeaderEntryTypeToString(sectionHeaderEntryType: SectionHeaderEntryType): string {
    switch (sectionHeaderEntryType) {
        case SectionHeaderEntryType.Null: return 'NULL';
        case SectionHeaderEntryType.ProgBits: return 'Prog bits';
        case SectionHeaderEntryType.SymTab: return 'Symbol table';
        case SectionHeaderEntryType.StrTab: return 'String table';
        case SectionHeaderEntryType.Rela: return 'Relocation with addends';
        case SectionHeaderEntryType.Hash: return 'Symbol hash table';
        case SectionHeaderEntryType.Dynamic: return 'Dynamic';
        case SectionHeaderEntryType.Note: return 'Note';
        case SectionHeaderEntryType.NoBits: return 'No bits';
        case SectionHeaderEntryType.Rel: return 'Relocation';
        case SectionHeaderEntryType.ShLib: return 'ShLib';
        case SectionHeaderEntryType.DynSym: return 'Dynamic linking symbols';
        case SectionHeaderEntryType.InitArray: return 'Init array';
        case SectionHeaderEntryType.FiniArray: return 'Fini array';
        case SectionHeaderEntryType.PreInitArray: return 'Pre-init array';
        case SectionHeaderEntryType.Group: return 'Section group';
        case SectionHeaderEntryType.ShNdx: return 'Extended symbol table index';
        case SectionHeaderEntryType.Num: return 'Num';
        case SectionHeaderEntryType.GnuAttributes: return 'GNU object attributes';
        case SectionHeaderEntryType.GnuHash: return 'GNU hash';
        case SectionHeaderEntryType.GnuLibList: return 'GNU pre-link library list';
        case SectionHeaderEntryType.GnuVerDef: return 'GNU version definition';
        case SectionHeaderEntryType.GnuVerNeed: return 'GNU version needs';
        case SectionHeaderEntryType.GnuVerSym: return 'GNU version symbol table';
        default:
            return SectionHeaderEntryType[sectionHeaderEntryType] || Number(sectionHeaderEntryType).toString();
    }
}

export function sectionFlagsToString(flags: number | bigint) {
    // no flags are more than 32 bits
    flags = Number(flags);

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

export function programHeaderFlagsToString(flags: number) {
    let str = [];
    if (flags & 0x4) str.push('Read');
    if (flags & 0x2) str.push('Write');
    if (flags & 0x1) str.push('Execute');
    return str.join(' | ');
}

export function elfFlagsToString(isa: ISA, flags: number): string {
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

export function symbolTypeToString(type: SymbolType) {
    switch (type) {
        case SymbolType.RelocationExpression: return "Relocation Expression";
        case SymbolType.SignedRelocationExpression: return "Signed Relocation Expression";
        case SymbolType.ThreadLocalStorage: return "Thread Local Storage";
        default: return SymbolType[type] || type.toString();
    }
}

export function symbolBindingToString(binding: SymbolBinding) {
    return SymbolBinding[binding] || binding.toString();
}

export function symbolVisibilityToString(visibility: SymbolVisibility) {
    return SymbolVisibility[visibility] || visibility.toString();
}