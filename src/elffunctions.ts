import { ELFFunctions, ELFSymbol, ELFSectionHeaderEntry, ELFProgramHeaderEntry, ELFFile, SectionHeaderEntryType } from "./types";
import { add, subtract } from './biginthelpers';


function filterSymbolsByVirtualAddress(elf: ELFFile, start: number | BigInt, size: number | BigInt): ELFSymbol[] {

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

function getSymbols(this: ELFFile, ): ELFSymbol[] {
    return this.sections
        .filter(she => she.symbols && she.symbols.length)
        .flatMap(x => x.symbols);
}

function getSymbolsInSection(this: ELFFile, sectionOrIndex: ELFSectionHeaderEntry | number): ELFSymbol[] {
    const section = typeof sectionOrIndex == 'number' ? this.sections[sectionOrIndex] : sectionOrIndex;
    return filterSymbolsByVirtualAddress(this, section.addr, section.size);
}

function getSymbolsInSegment(this: ELFFile, segmentOrIndex: ELFProgramHeaderEntry | number): ELFSymbol[] {
    const segment = typeof segmentOrIndex == 'number' ? this.segments[segmentOrIndex] : segmentOrIndex;
    return filterSymbolsByVirtualAddress(this, segment.vaddr, segment.memsz);
}

function getSectionsInSegment(this: ELFFile, segmentOrIndex: ELFProgramHeaderEntry | number): ELFSectionHeaderEntry[] {
    const segment = typeof segmentOrIndex == 'number' ? this.segments[segmentOrIndex] : segmentOrIndex;

    return this.sections.filter(x => x.addr > segment.vaddr && x.addr < add(segment.vaddr, segment.memsz));
}

function getSectionsForSymbol(this: ELFFile, symbol: ELFSymbol): ELFSectionHeaderEntry[] {
    const sections = [];
    for (const section of this.sections) {
        if (symbol.value >= section.addr && symbol.value <= add(section.addr, section.size)) {
            sections.push(section);
        }
    }

    return sections;
}

function getSectionForSymbol(this: ELFFile, symbol: ELFSymbol): ELFSectionHeaderEntry {
    return this.getSectionsForSymbol(symbol)[0]
}

function getSegmentsForSymbol(this: ELFFile, symbol: ELFSymbol): ELFProgramHeaderEntry[] {
    const segments = [];
    for (const segment of this.segments) {
        if (symbol.value >= segment.vaddr && symbol.value <= add(segment.vaddr, segment.memsz)) {
            segments.push(segment);
        }
    }

    return segments;
}

function getSegmentForSymbol(this: ELFFile, symbol: ELFSymbol): ELFProgramHeaderEntry {
    return this.getSegmentsForSymbol(symbol)[0];
}

function getSymbolsAtVirtualMemoryLocation(this: ELFFile, location: number | BigInt): ELFSymbol[] {
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

function getSymbolsAtPhysicalMemoryLocation(this: ELFFile, location: number | BigInt): ELFSymbol[] {
    return this.getSymbolsAtVirtualMemoryLocation(this.physicalAddressToVirtual(location));
}

function getSectionsAtVirtualMemoryLocation(this: ELFFile, location: number | BigInt): ELFSectionHeaderEntry[] {
    const sections = [];
    for (const section of this.sections) {
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
    for (const segment of this.segments) {
        if (location >= segment.vaddr && location < add(segment.vaddr, segment.memsz)) {
            segments.push(segment);
        }
    }
    return segments;
}

function getSegmentsAtPhysicalMemoryLocation(this: ELFFile, location: number | BigInt): ELFProgramHeaderEntry[] {
    const segments = [];
    for (const segment of this.segments) {
        if (location >= segment.paddr && location < add(segment.paddr, segment.filesz)) {
            segments.push(segment);
        }
    }
    return segments;
}

function virtualAddressToPhysical(this: ELFFile, location: number | BigInt): number | BigInt {
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

function virtualAddressToFileOffset(this: ELFFile, location: number | BigInt): number | BigInt {
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

function physicalAddressToVirtual(this: ELFFile, location: number | BigInt): number | BigInt {
    for (const segment of this.segments) {
        if (location >= segment.paddr && location < add(segment.paddr, segment.filesz)) {
            const offset = subtract(location, segment.paddr);
            return add(segment.vaddr, offset);
        }
    }

    return null;
}

function physicalAddressToFileOffset(this: ELFFile, location: number | BigInt): number | BigInt {
    for (const segment of this.segments) {
        if (location >= segment.paddr && location < add(segment.paddr, segment.filesz)) {
            const offset = subtract(location, segment.paddr);
            return add(segment.offset, offset);
        }
    }

    return null;
}

function fileOffsetToPhysicalAddress(this: ELFFile, location: number | BigInt): number | BigInt {
    for (const segment of this.segments) {
        if (location >= segment.offset && location < add(segment.offset, segment.filesz)) {
            const offset = subtract(location, segment.offset);
            return add(segment.paddr, offset);
        }
    }

    return null;
}

function fileOffsetToVirtualAddress(this: ELFFile, location: number | BigInt): number | BigInt {
    for (const segment of this.segments) {
        if (location >= segment.offset && location < add(segment.offset, segment.filesz)) {
            const offset = subtract(location, segment.offset);
            return add(segment.vaddr, offset);
        }
    }

    return null;
}

function getSectionByName(this: ELFFile, sectionName: string): ELFSectionHeaderEntry {
    return this.getSectionsByName(sectionName)[0];
}

function getSectionsByName(this: ELFFile, sectionName: string): ELFSectionHeaderEntry[] {
    return this.sections.filter(s => s.name.toUpperCase() == sectionName.toUpperCase());
}

function getSymbolByName(this: ELFFile, symbolName: string): ELFSymbol {
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

function getSymbolsByName(this: ELFFile, symbolName: string): ELFSymbol[] {
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

function getSymbolVirtualAddress(this: ELFFile, symbol: ELFSymbol): number | BigInt {
    return symbol.value;
}

function getSymbolPhysicalAddress(this: ELFFile, symbol: ELFSymbol): number | BigInt {
    return this.virtualAddressToPhysical(symbol.value);
}

function getSymbolFileOffset(this: ELFFile, symbol: ELFSymbol): number | BigInt {
    return this.virtualAddressToFileOffset(symbol.value);
}

export function getFunctions(): ELFFunctions {
    return {
        getSymbols,
        getSymbolsInSection,
        getSymbolsInSegment,
        getSectionsInSegment,
        getSectionsForSymbol,
        getSectionForSymbol,
        getSegmentsForSymbol,
        getSegmentForSymbol,
        getSymbolsAtVirtualMemoryLocation,
        getSymbolsAtPhysicalMemoryLocation,
        getSectionsAtVirtualMemoryLocation,
        getSectionsAtPhysicalMemoryLocation,
        getSegmentsAtVirtualMemoryLocation,
        getSegmentsAtPhysicalMemoryLocation,
        virtualAddressToPhysical,
        virtualAddressToFileOffset,
        physicalAddressToVirtual,
        physicalAddressToFileOffset,
        fileOffsetToPhysicalAddress,
        fileOffsetToVirtualAddress,
        getSectionByName,
        getSectionsByName,
        getSymbolByName,
        getSymbolsByName,
        getSymbolVirtualAddress,
        getSymbolPhysicalAddress,
        getSymbolFileOffset
    }
}