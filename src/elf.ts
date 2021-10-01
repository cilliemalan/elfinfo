import { ELF, ABI, ISA, ObjectType, ELFSegment, ELFSection, ELFSymbol, ELFSymbolSection } from "./types";
import { add, subtract, toNumberSafe } from './biginthelpers';
import { isSymbolSection } from "./sections";

function filterSymbolsByVirtualAddress(elf: ELF, start: number | bigint, size: number | bigint): ELFSymbol[] {

    const end = add(start, size);

    const symbols = [];
    for (const section of elf.sections) {
        if (isSymbolSection(section)) {
            for (const symbol of section.symbols) {
                if (symbol.virtualAddress && symbol.virtualAddress >= start && symbol.virtualAddress < end) {
                    symbols.push(symbol);
                }
            }
        }
    }

    return symbols;
}



/** Get a consolidates array of all the symbols in the file.
 * @param elf the ELF file.
 * @returns an array of symbols.
*/
export function getSymbols(elf: ELF): ELFSymbol[] {
    const result = [];
    for (const section of elf.sections) {
        if (isSymbolSection(section)) {
            for(const sym of section.symbols) {
                result.push(sym);
            }
        }
    }
    return result;
}

/** Get all the symbols that are addressed inside a given section.
 * @param elf the ELF file.
 * @param {ELFSection | number} sectionOrIndex either the section or the index of the section.
 * @returns {ELFSymbol[]} an array of symbols that are addressed in the section.
 */
export function getSymbolsInSection(elf: ELF, sectionOrIndex: ELFSection | number): ELFSymbol[] {
    const section = typeof sectionOrIndex == 'number' ? elf.sections[sectionOrIndex] : sectionOrIndex;
    return filterSymbolsByVirtualAddress(elf, section.addr, section.size);
}

/** Get all the symbols that are addressed inside a given segment. 
 * @param {ELFSegment | number} segmentOrIndex either the segment or the index of the segment.
 * @returns {ELFSymbol[]} an array of symbols that are addressed in the segment.
*/
export function getSymbolsInSegment(elf: ELF, segmentOrIndex: ELFSegment | number): ELFSymbol[] {
    const segment = typeof segmentOrIndex == 'number' ? elf.segments[segmentOrIndex] : segmentOrIndex;
    return filterSymbolsByVirtualAddress(elf, segment.vaddr, segment.memsz);
}

/** Get all the section that are addressed inside a given segment.
 * @param {ELFSegment | number} segmentOrIndex either the segment or the index of the segment.
 * @returns {ELFSection[]} an array of sections that are addressed in the segment.
*/
export function getSectionsInSegment(elf: ELF, segmentOrIndex: ELFSegment | number): ELFSection[] {
    const segment = typeof segmentOrIndex == 'number' ? elf.segments[segmentOrIndex] : segmentOrIndex;

    return elf.sections.filter(x => x.addr > segment.vaddr && x.addr < add(segment.vaddr, segment.memsz));
}

/** Get the first section in which a symbol is addressed.
 * @param {Symbol} symbol The symbol
 * @returns {ELFSection[]} an array of sections that contain the symbol.
 */
export function getSectionsForSymbol(elf: ELF, symbol: ELFSymbol): ELFSection[] {
    const sections = [];
    for (const section of elf.sections) {
        if (symbol.virtualAddress && 
            symbol.virtualAddress >= section.addr && 
            symbol.virtualAddress <= add(section.addr, section.size)) {
            sections.push(section);
        }
    }

    return sections;
}

/** Get all sections in which a symbol is addressed. 
 * @param {Symbol} symbol The symbol
 * @returns {ELFSection} the first section which contains the symbol.
*/
export function getSectionForSymbol(elf: ELF, symbol: ELFSymbol): ELFSection {
    return getSectionsForSymbol(elf, symbol)[0]
}

/** Get the first segment in which a symbol is addressed. 
 * @param {Symbol} symbol The symbol
 * @returns {ELFSection} all segments which contain the symbol.
*/
export function getSegmentsForSymbol(elf: ELF, symbol: ELFSymbol): ELFSegment[] {
    const segments = [];
    for (const segment of elf.segments) {
        if (symbol.virtualAddress && 
            symbol.virtualAddress >= segment.vaddr && 
            symbol.virtualAddress <= add(segment.vaddr, segment.memsz)) {
            segments.push(segment);
        }
    }

    return segments;
}

/** Get the first segment in which a symbol is addressed. 
 * @param {Symbol} symbol The symbol
 * @returns {ELFSection} the first segment which contains the symbol.
*/
export function getSegmentForSymbol(elf: ELF, symbol: ELFSymbol): ELFSegment | undefined {
    return getSegmentsForSymbol(elf, symbol)[0];
}

/** Find all symbols inside that overlap a given virtual memory location. 
 * @param {number | bigint} location The virtual memory address.
 * @returns {ELFSymbol[]} an array of symbols that contain the location.
*/
export function getSymbolsAtVirtualMemoryLocation(elf: ELF, location: number | bigint): ELFSymbol[] {
    const symbols: ELFSymbol[] = [];
    for (const section of elf.sections) {
        if (isSymbolSection(section)) {
            for (const symbol of section.symbols) {
                if (symbol.size == 0) {
                    if (symbol.virtualAddress === location) {
                        symbols.push(symbol);
                    }
                } else {
                    if (symbol.virtualAddress && 
                        location >= symbol.virtualAddress && 
                        location < add(symbol.virtualAddress, symbol.size)) {
                        symbols.push(symbol);
                    }
                }
            }
        }
    }

    return symbols;
}

/** Find all symbols inside that overlap a given physical memory location. 
 * @param {number | bigint} location The physical memory address.
 * @returns {ELFSymbol[]} an array of symbols that contain the location.
*/
export function getSymbolsAtPhysicalMemoryLocation(elf: ELF, location: number | bigint): ELFSymbol[] {
    const virtualAddress = physicalAddressToVirtual(elf, location);
    if (virtualAddress) {
        return getSymbolsAtVirtualMemoryLocation(elf, virtualAddress);
    } else {
        return [];
    }
}

/** Get all the sections that overlap a given virtual memory location 
 * @param {number | bigint} location The virtual memory address.
 * @returns {ELFSection[]} an array of sections that find the location inside of them.
*/
export function getSectionsAtVirtualMemoryLocation(elf: ELF, location: number | bigint): ELFSection[] {
    const sections = [];
    for (const section of elf.sections) {
        if (location >= section.addr && location < add(section.addr, section.size)) {
            sections.push(section);
        }
    }

    return sections;
}

/** Get all the sections that overlap a given physical memory location 
 * @param {number | bigint} location The physical memory address.
 * @returns {ELFSection[]} an array of sections that find the location inside of them.
*/
export function getSectionsAtPhysicalMemoryLocation(elf: ELF, location: number | bigint): ELFSection[] {
    const virtualAddress = physicalAddressToVirtual(elf, location);
    if (virtualAddress) {
        return getSectionsAtVirtualMemoryLocation(elf, virtualAddress);
    } else {
        return [];
    }
}

/** Get all the segments that overlap a given virtual memory location
 * @param {number | bigint} location The virtual memory address.
 * @returns {ELFSection} all segments which contain the address.
*/
export function getSegmentsAtVirtualMemoryLocation(elf: ELF, location: number | bigint): ELFSegment[] {
    const segments = [];
    for (const segment of elf.segments) {
        if (location >= segment.vaddr && location < add(segment.vaddr, segment.memsz)) {
            segments.push(segment);
        }
    }
    return segments;
}

/** Get all the segments that overlap a given physical memory location 
 * @param {number | bigint} location The physical memory address.
 * @returns {ELFSection} all segments which contain the address.
*/
export function getSegmentsAtPhysicalMemoryLocation(elf: ELF, location: number | bigint): ELFSegment[] {
    const segments = [];
    for (const segment of elf.segments) {
        if (location >= segment.paddr && location < add(segment.paddr, segment.filesz)) {
            segments.push(segment);
        }
    }
    return segments;
}

/** translate a virtual address to a physical address, if possible. 
 * @param location The virtual memory address.
 * @returns the physical address.
*/
export function virtualAddressToPhysical(elf: ELF, location: number | bigint): number | bigint | undefined {
    for (const segment of elf.segments) {
        if (location >= segment.vaddr && location <= add(segment.vaddr, segment.memsz)) {
            const offset = subtract(location, segment.vaddr);
            if (offset < segment.filesz) {
                return add(segment.paddr, offset);
            }
        }
    }

    return undefined;
}

/** translate a virtual address to an offset in the ELF file, if possible. 
 * @param {number | bigint} location The virtual memory address.
 * @returns {number | bigint} the file offset.
*/
export function virtualAddressToFileOffset(elf: ELF, location: number | bigint): number | undefined {
    for (const segment of elf.segments) {
        if (location >= segment.vaddr && location < add(segment.vaddr, segment.memsz)) {
            const offset = toNumberSafe(subtract(location, segment.vaddr));
            if (offset < segment.filesz) {
                return segment.offset + offset;
            }
        }
    }

    return undefined;
}

/** translate a physical address to a virtual address. 
 * @param {number | bigint} location The physical memory address.
 * @returns {number | bigint} the virtual address.
*/
export function physicalAddressToVirtual(elf: ELF, location: number | bigint): number | bigint | undefined {
    for (const segment of elf.segments) {
        if (location >= segment.paddr && location < add(segment.paddr, segment.filesz)) {
            const offset = subtract(location, segment.paddr);
            return add(segment.vaddr, offset);
        }
    }

    return undefined;
}

/** translate a physical address to an offset in the ELF file. 
 * @param {number | bigint} location The physical memory address.
 * @returns {number | bigint} the file offset.
*/
export function physicalAddressToFileOffset(elf: ELF, location: number | bigint): number | undefined {
    for (const segment of elf.segments) {
        if (location >= segment.paddr && location < add(segment.paddr, segment.filesz)) {
            const offset = toNumberSafe(subtract(location, segment.paddr));
            return segment.offset + offset;
        }
    }

    return undefined;
}

/** translate a file offset to a physical address, if possible. 
 * @param {number} location The file offset.
 * @returns {number | bigint} the physical address.
*/
export function fileOffsetToPhysicalAddress(elf: ELF, location: number): number | bigint | undefined {
    for (const segment of elf.segments) {
        if (location >= segment.offset && location < add(segment.offset, segment.filesz)) {
            const offset = subtract(location, segment.offset);
            return add(segment.paddr, offset);
        }
    }

    return undefined;
}

/** translate a file offset to a virtual address, if possible. 
 * @param {number} location The file offset.
 * @returns {number | bigint} the virtual address.
*/
export function fileOffsetToVirtualAddress(elf: ELF, location: number): number | bigint | undefined {
    for (const segment of elf.segments) {
        if (location >= segment.offset && location < add(segment.offset, segment.filesz)) {
            const offset = subtract(location, segment.offset);
            return add(segment.vaddr, offset);
        }
    }

    return undefined;
}

/** Get the first section that matches the name (case-insensitive). 
 * @param {string} sectionName the name of the section to find.
 * @returns {ELFSection} The first section that matches the name
*/
export function getSectionByName(elf: ELF, sectionName: string): ELFSection {
    return getSectionsByName(elf, sectionName)[0];
}

/** Get all sections that matches the name (case-insensitive). 
 * @param {string} sectionName the name of the sections to find.
 * @returns {ELFSection[]} an array of sections that match the name.
*/
export function getSectionsByName(elf: ELF, sectionName: string): ELFSection[] {
    return elf.sections.filter(s => s.name.toUpperCase() == sectionName.toUpperCase());
}

/** Get the first symbol that matches the name (case-insensitive). 
 * @param {string} symbolName the name of the symbol to find.
 * @returns {ELFSymbol[]} an array of symbols that match the name.
*/
export function getSymbolByName(elf: ELF, symbolName: string): ELFSymbol | undefined {
    for (const section of elf.sections) {
        if (isSymbolSection(section)) {
            for (const symbol of section.symbols) {
                if (symbol.name && symbol.name.toUpperCase() == symbolName.toUpperCase()) {
                    return symbol
                }
            }
        }
    }

    return undefined;
}

/** Get all symbols that matches the name (case-insensitive). 
 * @param {string} symbolName the name of the symbols to find.
 * @returns {ELFSymbol[]} an array of symbols that match the name.
 * 
*/
export function getSymbolsByName(elf: ELF, symbolName: string): ELFSymbol[] {
    const matches = [];
    for (const section of elf.sections) {
        if (isSymbolSection(section)) {
            for (const symbol of section.symbols) {
                if (symbol.name && symbol.name.toUpperCase() == symbolName.toUpperCase()) {
                    matches.push(symbol);
                }
            }
        }
    }
    return matches;
}