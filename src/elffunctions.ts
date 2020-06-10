import { ELFFunctions, ELFSymbol, ELFSectionHeaderEntry, ELFProgramHeaderEntry, ELFFile, SectionHeaderEntryType } from "./types";
import { add, subtract } from './biginthelpers';

function getSymbols(this: ELFFile, ): ELFSymbol[] {
    return this.sectionHeaderEntries
        .filter(she => she.type == SectionHeaderEntryType.SymTab)
        .flatMap(x => x.symbols);
}

function getSymbolsInSection(this: ELFFile, sectionOrIndex: ELFSectionHeaderEntry | number): ELFSymbol[] {
    const section = typeof sectionOrIndex == 'number' ? this.sectionHeaderEntries[sectionOrIndex] : sectionOrIndex;

    if (section.symbols == null) {
        return [];
    } else {
        return section.symbols;
    }
}

function getSymbolsInSegment(this: ELFFile, segmentOrIndex: ELFProgramHeaderEntry | number): ELFSymbol[] {
    return this.getSectionsInSegment(segmentOrIndex)
        .flatMap(section => section.symbols || []);
}

function getSectionsInSegment(this: ELFFile, segmentOrIndex: ELFProgramHeaderEntry | number): ELFSectionHeaderEntry[] {
    const segment = typeof segmentOrIndex == 'number' ? this.programHeaderEntries[segmentOrIndex] : segmentOrIndex;

    return this.sectionHeaderEntries.filter(x => x.addr > segment.vaddr && x.addr < add(segment.vaddr, segment.memsz));
}

function getSectionForSymbol(this: ELFFile, symbol: ELFSymbol): ELFSectionHeaderEntry {
    for (const section of this.sectionHeaderEntries) {
        if (section.symbols && section.symbols.includes(symbol)) {
            return section;
        }
    }

    return null;
}

function getSegmentForSymbol(this: ELFFile, symbol: ELFSymbol): ELFProgramHeaderEntry {
    const section = this.getSectionForSymbol(symbol);
    if (section != null) {
        for (const segment of this.programHeaderEntries) {
            if (section.addr > segment.vaddr && section.addr < add(segment.vaddr, segment.memsz)) {
                return segment;
            }
        }
    } else {
        return null;
    }
}

function getSymbolsAtVirtualMemoryLocation(this: ELFFile, location: number | BigInt): ELFSymbol[] {
    const symbols: ELFSymbol[] = [];
    for (const section of this.sectionHeaderEntries) {
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

function getSymbolsAtPhysicalMemoryLocation(this: ELFFile, location: number | BigInt): ELFSymbol[] {
    return this.getSymbolsAtVirtualMemoryLocation(this.physicalAddressToVirtual(location));
}

function getSectionsAtVirtualMemoryLocation(this: ELFFile, location: number | BigInt): ELFSectionHeaderEntry[] {
    const sections = [];
    for (const section of this.sectionHeaderEntries) {
        if (location >= section.addr && location < add(section.addr, section.size)) {
            sections.push(section);
        }
    }

    return sections;
}

function getSectionsAtPhysicalMemoryLocation(this: ELFFile, location: number | BigInt): ELFSectionHeaderEntry[] {
    return this.getSectionsAtVirtualMemoryLocation(this.physicalAddressToVirtual(location));
}

function getSegmentsAtVirtualMemoryLocation(this: ELFFile, location: number | BigInt): ELFProgramHeaderEntry[] {
    const segments = [];
    for (const segment of this.programHeaderEntries) {
        if (location >= segment.vaddr && location < add(segment.vaddr, segment.memsz)) {
            segments.push(segment);
        }
    }
    return segments;
}

function getSegmentsAtPhysicalMemoryLocation(this: ELFFile, location: number | BigInt): ELFProgramHeaderEntry[] {
    const segments = [];
    for (const segment of this.programHeaderEntries) {
        if (location >= segment.paddr && location < add(segment.paddr, segment.filesz)) {
            segments.push(segment);
        }
    }
    return segments;
}

function virtualAddressToPhysical(this: ELFFile, location: number | BigInt): number | BigInt {
    for (const segment of this.programHeaderEntries) {
        if (location >= segment.vaddr && location <= add(segment.vaddr, segment.memsz)) {
            const offset = subtract(location, segment.vaddr);
            return add(segment.paddr, offset);
        }
    }
}

function physicalAddressToVirtual(this: ELFFile, location: number | BigInt): number | BigInt {
    for (const segment of this.programHeaderEntries) {
        if (location >= segment.paddr && location <= add(segment.paddr, segment.filesz)) {
            const offset = subtract(location, segment.paddr);
            return add(segment.vaddr, offset);
        }
    }
}

export function getFunctions(): ELFFunctions {
    return {
        getSymbols,
        getSymbolsInSection,
        getSymbolsInSegment,
        getSectionsInSegment,
        getSectionForSymbol,
        getSegmentForSymbol,
        getSymbolsAtVirtualMemoryLocation,
        getSymbolsAtPhysicalMemoryLocation,
        getSectionsAtVirtualMemoryLocation,
        getSectionsAtPhysicalMemoryLocation,
        getSegmentsAtVirtualMemoryLocation,
        getSegmentsAtPhysicalMemoryLocation,
        virtualAddressToPhysical,
        physicalAddressToVirtual
    }
}