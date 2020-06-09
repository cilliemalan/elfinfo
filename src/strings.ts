import {
    ISA, ABI, ObjectType,
    ProgramHeaderEntryType, SectionHeaderEntryType,
    SymbolType, SymbolBinding, SymbolVisibility
} from './types';

export function isaToString(isa: ISA): string {
    switch (isa) {
        case ISA.IA64: return 'IA-64';
        case ISA.RiscV: return 'RISC-V';
        default:
            return ISA[isa] || isa.toString();
    }
}

export function abiToString(abi: ABI): string {
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

export function sectionFlagsToString(flags: number | BigInt) {
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

export function shndxToString(shndx: number) {
    if (shndx === 0) return 'Undefined';
    else if (shndx === 0xfffffff1) return 'Absolute';
    else if (shndx === 0xfffffff2) return 'Common';
    else return shndx.toString();
}