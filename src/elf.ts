import { ABI, ISA, ObjectType, ELFProgramHeaderEntry, ELFSectionHeaderEntry, ELFSymbol } from "./types";
import { ELF as ELFInterface } from './types';
import { add, subtract } from "./biginthelpers";

function filterSymbolsByVirtualAddress(elf: ELF, start: number | BigInt, size: number | BigInt): ELFSymbol[] {

    const end = add(start, size);

    const symbols = [];
    for (const section of elf.sections) {
        if (section.symbols) {
            for (const symbol of section.symbols) {
                if (symbol.value >= start && symbol.value < end) {
                    symbols.push(symbol);
                }
            }
        }
    }

    return symbols;
}

export class ELF implements ELFInterface {
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

    getSymbols(): ELFSymbol[] {
        return this.sections
            .filter(she => she.symbols && she.symbols.length)
            .flatMap(x => x.symbols);
    }

    getSymbolsInSection(sectionOrIndex: ELFSectionHeaderEntry | number): ELFSymbol[] {
        const section = typeof sectionOrIndex == 'number' ? this.sections[sectionOrIndex] : sectionOrIndex;
        return filterSymbolsByVirtualAddress(this, section.addr, section.size);
    }

    getSymbolsInSegment(segmentOrIndex: ELFProgramHeaderEntry | number): ELFSymbol[] {
        const segment = typeof segmentOrIndex == 'number' ? this.segments[segmentOrIndex] : segmentOrIndex;
        return filterSymbolsByVirtualAddress(this, segment.vaddr, segment.memsz);
    }

    getSectionsInSegment(segmentOrIndex: ELFProgramHeaderEntry | number): ELFSectionHeaderEntry[] {
        const segment = typeof segmentOrIndex == 'number' ? this.segments[segmentOrIndex] : segmentOrIndex;

        return this.sections.filter(x => x.addr > segment.vaddr && x.addr < add(segment.vaddr, segment.memsz));
    }

    getSectionsForSymbol(symbol: ELFSymbol): ELFSectionHeaderEntry[] {
        const sections = [];
        for (const section of this.sections) {
            if (symbol.value >= section.addr && symbol.value <= add(section.addr, section.size)) {
                sections.push(section);
            }
        }

        return sections;
    }

    getSectionForSymbol(symbol: ELFSymbol): ELFSectionHeaderEntry {
        return this.getSectionsForSymbol(symbol)[0]
    }

    getSegmentsForSymbol(symbol: ELFSymbol): ELFProgramHeaderEntry[] {
        const segments = [];
        for (const segment of this.segments) {
            if (symbol.value >= segment.vaddr && symbol.value <= add(segment.vaddr, segment.memsz)) {
                segments.push(segment);
            }
        }

        return segments;
    }

    getSegmentForSymbol(symbol: ELFSymbol): ELFProgramHeaderEntry {
        return this.getSegmentsForSymbol(symbol)[0];
    }

    getSymbolsAtVirtualMemoryLocation(location: number | BigInt): ELFSymbol[] {
        const symbols: ELFSymbol[] = [];
        for (const section of this.sections) {
            if (section.symbols) {
                for (const symbol of section.symbols) {
                    if (symbol.size == 0) {
                        if (symbol.value == location) {
                            symbols.push(symbol);
                        }
                    } else {
                        if (location >= symbol.value && location < add(symbol.value, symbol.size)) {
                            symbols.push(symbol);
                        }
                    }
                }
            }
        }

        return symbols;
    }

    getSymbolsAtPhysicalMemoryLocation(location: number | BigInt): ELFSymbol[] {
        return this.getSymbolsAtVirtualMemoryLocation(this.physicalAddressToVirtual(location));
    }

    getSectionsAtVirtualMemoryLocation(location: number | BigInt): ELFSectionHeaderEntry[] {
        const sections = [];
        for (const section of this.sections) {
            if (location >= section.addr && location < add(section.addr, section.size)) {
                sections.push(section);
            }
        }

        return sections;
    }

    getSectionsAtPhysicalMemoryLocation(location: number | BigInt): ELFSectionHeaderEntry[] {
        return this.getSectionsAtVirtualMemoryLocation(this.physicalAddressToVirtual(location));
    }

    getSegmentsAtVirtualMemoryLocation(location: number | BigInt): ELFProgramHeaderEntry[] {
        const segments = [];
        for (const segment of this.segments) {
            if (location >= segment.vaddr && location < add(segment.vaddr, segment.memsz)) {
                segments.push(segment);
            }
        }
        return segments;
    }

    getSegmentsAtPhysicalMemoryLocation(location: number | BigInt): ELFProgramHeaderEntry[] {
        const segments = [];
        for (const segment of this.segments) {
            if (location >= segment.paddr && location < add(segment.paddr, segment.filesz)) {
                segments.push(segment);
            }
        }
        return segments;
    }

    virtualAddressToPhysical(location: number | BigInt): number | BigInt {
        for (const segment of this.segments) {
            if (location >= segment.vaddr && location <= add(segment.vaddr, segment.memsz)) {
                const offset = subtract(location, segment.vaddr);
                if (offset < segment.filesz) {
                    return add(segment.paddr, offset);
                }
            }
        }

        return null;
    }

    virtualAddressToFileOffset(location: number | BigInt): number | BigInt {
        for (const segment of this.segments) {
            if (location >= segment.vaddr && location < add(segment.vaddr, segment.memsz)) {
                const offset = subtract(location, segment.vaddr);
                if (offset < segment.filesz) {
                    return add(segment.offset, offset);
                }
            }
        }

        return null;
    }

    physicalAddressToVirtual(location: number | BigInt): number | BigInt {
        for (const segment of this.segments) {
            if (location >= segment.paddr && location < add(segment.paddr, segment.filesz)) {
                const offset = subtract(location, segment.paddr);
                return add(segment.vaddr, offset);
            }
        }

        return null;
    }

    physicalAddressToFileOffset(location: number | BigInt): number | BigInt {
        for (const segment of this.segments) {
            if (location >= segment.paddr && location < add(segment.paddr, segment.filesz)) {
                const offset = subtract(location, segment.paddr);
                return add(segment.offset, offset);
            }
        }

        return null;
    }

    fileOffsetToPhysicalAddress(location: number | BigInt): number | BigInt {
        for (const segment of this.segments) {
            if (location >= segment.offset && location < add(segment.offset, segment.filesz)) {
                const offset = subtract(location, segment.offset);
                return add(segment.paddr, offset);
            }
        }

        return null;
    }

    fileOffsetToVirtualAddress(location: number | BigInt): number | BigInt {
        for (const segment of this.segments) {
            if (location >= segment.offset && location < add(segment.offset, segment.filesz)) {
                const offset = subtract(location, segment.offset);
                return add(segment.vaddr, offset);
            }
        }

        return null;
    }

    getSectionByName(sectionName: string): ELFSectionHeaderEntry {
        return this.getSectionsByName(sectionName)[0];
    }

    getSectionsByName(sectionName: string): ELFSectionHeaderEntry[] {
        return this.sections.filter(s => s.name.toUpperCase() == sectionName.toUpperCase());
    }

    getSymbolByName(symbolName: string): ELFSymbol {
        for (const section of this.sections) {
            if (section.symbols) {
                for (const symbol of section.symbols) {
                    if (symbol.name && symbol.name.toUpperCase() == symbolName.toUpperCase()) {
                        return symbol
                    }
                }
            }
        }

        return null;
    }

    getSymbolsByName(symbolName: string): ELFSymbol[] {
        const matches = [];
        for (const section of this.sections) {
            if (section.symbols) {
                for (const symbol of section.symbols) {
                    if (symbol.name && symbol.name.toUpperCase() == symbolName.toUpperCase()) {
                        matches.push(symbol);
                    }
                }
            }
        }
        return matches;
    }

    getSymbolVirtualAddress(symbol: ELFSymbol): number | BigInt {
        return symbol.value;
    }

    getSymbolPhysicalAddress(symbol: ELFSymbol): number | BigInt {
        return this.virtualAddressToPhysical(symbol.value);
    }

    getSymbolFileOffset(symbol: ELFSymbol): number | BigInt {
        return this.virtualAddressToFileOffset(symbol.value);
    }
}