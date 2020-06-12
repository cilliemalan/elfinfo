import { ABI, ISA, ObjectType, ELFProgramHeaderEntry, ELFSectionHeaderEntry, ELFSymbol } from "./types";
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

/**
 * Information parsed from an ELF file.
 */
export class ELF {
    /** The path of the file. Only set when parse was called with a path. */
    path: string;
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

    /** Get a consolidates array of all the symbols in the file. 
     * @returns {ELFSymbol[]} an array of symbols.
    */
    getSymbols(): ELFSymbol[] {
        return this.sections
            .filter(she => she.symbols && she.symbols.length)
            .flatMap(x => x.symbols);
    }

    /** Get all the symbols that are addressed inside a given section.
     * @param {ELFSectionHeaderEntry | number} sectionOrIndex either the section or the index of the section.
     * @returns {ELFSymbol[]} an array of symbols that are addressed in the section.
     */
    getSymbolsInSection(sectionOrIndex: ELFSectionHeaderEntry | number): ELFSymbol[] {
        const section = typeof sectionOrIndex == 'number' ? this.sections[sectionOrIndex] : sectionOrIndex;
        return filterSymbolsByVirtualAddress(this, section.addr, section.size);
    }

    /** Get all the symbols that are addressed inside a given segment. 
     * @param {ELFProgramHeaderEntry | number} segmentOrIndex either the segment or the index of the segment.
     * @returns {ELFSymbol[]} an array of symbols that are addressed in the segment.
    */
    getSymbolsInSegment(segmentOrIndex: ELFProgramHeaderEntry | number): ELFSymbol[] {
        const segment = typeof segmentOrIndex == 'number' ? this.segments[segmentOrIndex] : segmentOrIndex;
        return filterSymbolsByVirtualAddress(this, segment.vaddr, segment.memsz);
    }

    /** Get all the section that are addressed inside a given segment.
     * @param {ELFProgramHeaderEntry | number} segmentOrIndex either the segment or the index of the segment.
     * @returns {ELFSectionHeaderEntry[]} an array of sections that are addressed in the segment.
    */
    getSectionsInSegment(segmentOrIndex: ELFProgramHeaderEntry | number): ELFSectionHeaderEntry[] {
        const segment = typeof segmentOrIndex == 'number' ? this.segments[segmentOrIndex] : segmentOrIndex;

        return this.sections.filter(x => x.addr > segment.vaddr && x.addr < add(segment.vaddr, segment.memsz));
    }

    /** Get the first section in which a symbol is addressed.
     * @param {Symbol} symbol The symbol
     * @returns {ELFSectionHeaderEntry[]} an array of sections that contain the symbol.
     */
    getSectionsForSymbol(symbol: ELFSymbol): ELFSectionHeaderEntry[] {
        const sections = [];
        for (const section of this.sections) {
            if (symbol.value >= section.addr && symbol.value <= add(section.addr, section.size)) {
                sections.push(section);
            }
        }

        return sections;
    }

    /** Get all sections in which a symbol is addressed. 
     * @param {Symbol} symbol The symbol
     * @returns {ELFSectionHeaderEntry} the first section which contains the symbol.
    */
    getSectionForSymbol(symbol: ELFSymbol): ELFSectionHeaderEntry {
        return this.getSectionsForSymbol(symbol)[0]
    }

    /** Get the first segment in which a symbol is addressed. 
     * @param {Symbol} symbol The symbol
     * @returns {ELFSectionHeaderEntry} all segments which contain the symbol.
    */
    getSegmentsForSymbol(symbol: ELFSymbol): ELFProgramHeaderEntry[] {
        const segments = [];
        for (const segment of this.segments) {
            if (symbol.value >= segment.vaddr && symbol.value <= add(segment.vaddr, segment.memsz)) {
                segments.push(segment);
            }
        }

        return segments;
    }

    /** Get the first segment in which a symbol is addressed. 
     * @param {Symbol} symbol The symbol
     * @returns {ELFSectionHeaderEntry} the first segment which contains the symbol.
    */
    getSegmentForSymbol(symbol: ELFSymbol): ELFProgramHeaderEntry {
        return this.getSegmentsForSymbol(symbol)[0];
    }

    /** Find all symbols inside that overlap a given virtual memory location. 
     * @param {number | BigInt} location The virtual memory address.
     * @returns {ELFSymbol[]} an array of symbols that contain the location.
    */
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

    /** Find all symbols inside that overlap a given physical memory location. 
     * @param {number | BigInt} location The physical memory address.
     * @returns {ELFSymbol[]} an array of symbols that contain the location.
    */
    getSymbolsAtPhysicalMemoryLocation(location: number | BigInt): ELFSymbol[] {
        return this.getSymbolsAtVirtualMemoryLocation(this.physicalAddressToVirtual(location));
    }

    /** Get all the sections that overlap a given virtual memory location 
     * @param {number | BigInt} location The virtual memory address.
     * @returns {ELFSectionHeaderEntry[]} an array of sections that find the location inside of them.
    */
    getSectionsAtVirtualMemoryLocation(location: number | BigInt): ELFSectionHeaderEntry[] {
        const sections = [];
        for (const section of this.sections) {
            if (location >= section.addr && location < add(section.addr, section.size)) {
                sections.push(section);
            }
        }

        return sections;
    }

    /** Get all the sections that overlap a given physical memory location 
     * @param {number | BigInt} location The physical memory address.
     * @returns {ELFSectionHeaderEntry[]} an array of sections that find the location inside of them.
    */
    getSectionsAtPhysicalMemoryLocation(location: number | BigInt): ELFSectionHeaderEntry[] {
        return this.getSectionsAtVirtualMemoryLocation(this.physicalAddressToVirtual(location));
    }

    /** Get all the segments that overlap a given virtual memory location
     * @param {number | BigInt} location The virtual memory address.
     * @returns {ELFSectionHeaderEntry} all segments which contain the address.
    */
    getSegmentsAtVirtualMemoryLocation(location: number | BigInt): ELFProgramHeaderEntry[] {
        const segments = [];
        for (const segment of this.segments) {
            if (location >= segment.vaddr && location < add(segment.vaddr, segment.memsz)) {
                segments.push(segment);
            }
        }
        return segments;
    }

    /** Get all the segments that overlap a given physical memory location 
     * @param {number | BigInt} location The physical memory address.
     * @returns {ELFSectionHeaderEntry} all segments which contain the address.
    */
    getSegmentsAtPhysicalMemoryLocation(location: number | BigInt): ELFProgramHeaderEntry[] {
        const segments = [];
        for (const segment of this.segments) {
            if (location >= segment.paddr && location < add(segment.paddr, segment.filesz)) {
                segments.push(segment);
            }
        }
        return segments;
    }

    /** translate a virtual address to a physical address, if possible. 
     * @param {number | BigInt} location The virtual memory address.
     * @returns {number | BigInt} the physical address.
    */
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

    /** translate a virtual address to an offset in the ELF file, if possible. 
     * @param {number | BigInt} location The virtual memory address.
     * @returns {number | BigInt} the file offset.
    */
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

    /** translate a physical address to a virtual address. 
     * @param {number | BigInt} location The physical memory address.
     * @returns {number | BigInt} the virtual address.
    */
    physicalAddressToVirtual(location: number | BigInt): number | BigInt {
        for (const segment of this.segments) {
            if (location >= segment.paddr && location < add(segment.paddr, segment.filesz)) {
                const offset = subtract(location, segment.paddr);
                return add(segment.vaddr, offset);
            }
        }

        return null;
    }

    /** translate a physical address to an offset in the ELF file. 
     * @param {number | BigInt} location The physical memory address.
     * @returns {number | BigInt} the file offset.
    */
    physicalAddressToFileOffset(location: number | BigInt): number | BigInt {
        for (const segment of this.segments) {
            if (location >= segment.paddr && location < add(segment.paddr, segment.filesz)) {
                const offset = subtract(location, segment.paddr);
                return add(segment.offset, offset);
            }
        }

        return null;
    }

    /** translate a file offset to a physical address, if possible. 
     * @param {number | BigInt} location The file offset.
     * @returns {number | BigInt} the physical address.
    */
    fileOffsetToPhysicalAddress(location: number | BigInt): number | BigInt {
        for (const segment of this.segments) {
            if (location >= segment.offset && location < add(segment.offset, segment.filesz)) {
                const offset = subtract(location, segment.offset);
                return add(segment.paddr, offset);
            }
        }

        return null;
    }

    /** translate a file offset to a virtual address, if possible. 
     * @param {number | BigInt} location The file offset.
     * @returns {number | BigInt} the virtual address.
    */
    fileOffsetToVirtualAddress(location: number | BigInt): number | BigInt {
        for (const segment of this.segments) {
            if (location >= segment.offset && location < add(segment.offset, segment.filesz)) {
                const offset = subtract(location, segment.offset);
                return add(segment.vaddr, offset);
            }
        }

        return null;
    }

    /** Get the first section that matches the name (case-insensitive). 
     * @param {string} sectionName the name of the section to find.
     * @returns {ELFSectionHeaderEntry} The first section that matches the name
    */
    getSectionByName(sectionName: string): ELFSectionHeaderEntry {
        return this.getSectionsByName(sectionName)[0];
    }

    /** Get all sections that matches the name (case-insensitive). 
     * @param {string} sectionName the name of the sections to find.
     * @returns {ELFSectionHeaderEntry[]} an array of sections that match the name.
    */
    getSectionsByName(sectionName: string): ELFSectionHeaderEntry[] {
        return this.sections.filter(s => s.name.toUpperCase() == sectionName.toUpperCase());
    }

    /** Get the first symbol that matches the name (case-insensitive). 
     * @param {string} symbolName the name of the symbol to find.
     * @returns {ELFSymbol[]} an array of symbols that match the name.
    */
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

    /** Get all symbols that matches the name (case-insensitive). 
     * @param {string} symbolName the name of the symbols to find.
     * @returns {ELFSymbol[]} an array of symbols that match the name.
     * 
    */
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

    /** Get the virtual address for a symbol. This is just symbol.value. 
     * @param {Symbol} symbol The symbol.
     * @returns {number | BigInt} The virtual address for the symbol.
    */
    getSymbolVirtualAddress(symbol: ELFSymbol): number | BigInt {
        return symbol.value;
    }

    /** Get the physical address for a symbol, if possible. 
     * @param {Symbol} symbol The symbol.
     * @returns {number | BigInt} The physical address for the symbol.
     * 
    */
    getSymbolPhysicalAddress(symbol: ELFSymbol): number | BigInt {
        return this.virtualAddressToPhysical(symbol.value);
    }

    /** Get the offset of a symbol in the ELF file, if possible. 
     * @param {Symbol} symbol The symbol.
     * @returns {number | BigInt} The file offset for the symbol.
     * 
    */
    getSymbolFileOffset(symbol: ELFSymbol): number | BigInt {
        return this.virtualAddressToFileOffset(symbol.value);
    }
}