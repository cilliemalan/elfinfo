import assert from 'assert';
import {
    ELF, fileOffsetToPhysicalAddress, fileOffsetToVirtualAddress,
    getSectionByName, getSectionForSymbol, getSectionsAtPhysicalMemoryLocation,
    getSectionsAtVirtualMemoryLocation, getSectionsByName, getSectionsInSegment,
    getSegmentForSymbol, getSegmentsAtPhysicalMemoryLocation, getSegmentsAtVirtualMemoryLocation,
    getSymbolByName, getSymbols, getSymbolsAtPhysicalMemoryLocation, getSymbolsAtVirtualMemoryLocation,
    getSymbolsInSection, getSymbolsInSegment, open, physicalAddressToFileOffset,
    physicalAddressToVirtual, SymbolType, virtualAddressToFileOffset,
    virtualAddressToPhysical
} from "../src";
import fs from 'fs';
import { testPrograms } from './testprograms';
import { category, test } from './';

async function load(data: Uint8Array): Promise<ELF> {
    const elf = await open(data);
    elf.warnings.forEach(w => console.warn(w));
    elf.errors.forEach(e => console.error(e));
    assert(elf);
    assert(elf.elf);
    assert(elf.success === true);
    return elf.elf;
}

category("Functions", () => {

    const elfdata = testPrograms['clang-x64'].program;
    const armelfdata = testPrograms['arm-eabi'].program;

    test(`getSymbols works`, async () => {
        const elf = await load(elfdata);
        const allsyms = getSymbols(elf);
        assert(allsyms);
        assert(allsyms.length > 0);
        assert(allsyms.filter(x => x.name == 'main.cpp').length === 1);
        assert(allsyms.filter(x => x.name == '__init_array_end').length === 1);
        assert(allsyms.filter(x => x.name == '_Z10factorialff').length === 1);
        assert(allsyms.filter(x => x.name == 'printf').length === 1);
    });

    test(`getSymbolsInSection (section) works`, async () => {
        const elf = await load(elfdata);
        const section = getSectionByName(elf, '.text');
        const syms = getSymbolsInSection(elf, section);
        assert(syms);
        assert(syms.length > 0);
        assert(syms.filter(x => x.name == '_Z10factorialff').length !==0);
    });

    test(`getSymbolsInSection (index) works`, async () => {
        const elf = await load(elfdata);
        const section = getSectionByName(elf, '.text');
        const syms = getSymbolsInSection(elf, section.index);
        assert(syms);
        assert(syms.length > 0);
        assert(syms.filter(x => x.name == 'main').length !==0);
    });

    test(`getSymbolsInSegment (segment) works`, async () => {
        // TODO: this will likely break between compilers
        const elf = await load(elfdata);
        const syms = getSymbolsInSegment(elf, elf.segments[3]);
        assert(syms);
        assert(syms.length > 0);
        assert(syms.filter(x => x.name == 'main').length !==0);
    });

    test(`getSymbolsInSegment (index) works`, async () => {
        const elf = await load(elfdata);
        const syms = getSymbolsInSegment(elf, 3);
        assert(syms);
        assert(syms.length > 0);
        assert(syms.filter(x => x.name == '_Z10factorialff').length !==0);
    });

    test(`getSectionsInSegment works`, async () => {
        const elf = await load(elfdata);
        const sections1 = getSectionsInSegment(elf, 3);
        assert(sections1);
        assert(sections1.length > 0);
        assert(sections1.filter(x => x.name == '.text').length !==0);
        const sections2 = getSectionsInSegment(elf, 5);
        assert(sections2);
        assert(sections2.length > 0);
        assert(sections2.filter(x => x.name == '.bss').length !==0);
    });

    test(`getSectionForSymbol works`, async () => {
        const elf = await load(elfdata);
        const symbol = getSymbolByName(elf, 'main');
        assert(symbol);
        const section = getSectionForSymbol(elf, symbol);
        assert(section);
        assert(section.name === '.text');
    });

    test(`getSegmentForSymbol works`, async () => {
        const elf = await load(elfdata);
        const symbol = getSymbolByName(elf, 'main');
        assert(symbol);
        const segment = getSegmentForSymbol(elf, symbol);
        assert(segment);
    });

    test(`getSymbolsAtVirtualMemoryLocation works when queried at start of symbol`, async () => {
        const elf = await load(armelfdata);
        const symbol = getSymbolByName(elf, 'errno');
        assert(symbol);
        const symbols = getSymbolsAtVirtualMemoryLocation(elf, Number(symbol.value));
        assert(symbols);
        assert(symbols.length > 0);
        assert(symbols.includes(symbol));
    });

    test(`getSymbolsAtVirtualMemoryLocation works when queried in middle of symbol`, async () => {
        const elf = await load(armelfdata);
        const symbol = getSymbolByName(elf, 'errno');
        assert(symbol);
        const symbols = getSymbolsAtVirtualMemoryLocation(elf, Number(symbol.value) + 2);
        assert(symbols);
        assert(symbols.length > 0);
        assert(symbols.includes(symbol));
    });

    test(`getSymbolsAtVirtualMemoryLocation works when queried on last byte of symbol`, async () => {
        const elf = await load(armelfdata);
        const symbol = getSymbolByName(elf, 'errno');
        assert(symbol);
        const symbols = getSymbolsAtVirtualMemoryLocation(elf, Number(symbol.value) + Number(symbol.size) - 1);
        assert(symbols);
        assert(symbols.length > 0);
        assert(symbols.includes(symbol));
    });

    test(`getSymbolsAtVirtualMemoryLocation does not work when queried past end of symbol`, async () => {
        const elf = await load(armelfdata);
        const symbol = getSymbolByName(elf, 'errno');
        assert(symbol);
        const symbols = getSymbolsAtVirtualMemoryLocation(elf, Number(symbol.value) + Number(symbol.size));
        assert(symbols);
        assert(!(symbols.includes(symbol)));
    });

    test(`getSymbolsAtVirtualMemoryLocation does not work when queried past beginning of symbol`, async () => {
        const elf = await load(armelfdata);
        const symbol = getSymbolByName(elf, 'errno');
        assert(symbol);
        const symbols = getSymbolsAtVirtualMemoryLocation(elf, Number(symbol.value) - 1);
        assert(symbols);
        assert(!(symbols.includes(symbol)));
    });

    test(`getSymbolsAtPhysicalMemoryLocation works when queried at start of symbol`, async () => {
        const elf = await load(armelfdata);
        const symbol = getSymbolByName(elf, 'globaldatastring');
        assert(symbol);
        const symbolAddress = virtualAddressToPhysical(elf, symbol.value);
        assert(symbolAddress !== undefined);
        const symbols = getSymbolsAtPhysicalMemoryLocation(elf, symbolAddress);
        assert(symbols);
        assert(symbols.length > 0);
        assert(symbols.includes(symbol));
    });

    test(`getSymbolsAtPhysicalMemoryLocation works when queried in middle of symbol`, async () => {
        const elf = await load(armelfdata);
        const symbol = getSymbolByName(elf, 'globaldatastring');
        assert(symbol);
        const symbolAddress = virtualAddressToPhysical(elf, symbol.value);
        const symbols = getSymbolsAtPhysicalMemoryLocation(elf, Number(symbolAddress) + 2);
        assert(symbols);
        assert(symbols.length > 0);
        assert(symbols.includes(symbol));
    });

    test(`getSymbolsAtPhysicalMemoryLocation works when queried on last byte of symbol`, async () => {
        const elf = await load(armelfdata);
        const symbol = getSymbolByName(elf, 'globaldatastring');
        assert(symbol);
        const symbolAddress = virtualAddressToPhysical(elf, symbol.value);
        const symbols = getSymbolsAtPhysicalMemoryLocation(elf, Number(symbolAddress) + Number(symbol.size) - 1);
        assert(symbols);
        assert(symbols.length > 0);
        assert(symbols.includes(symbol));
    });

    test(`getSymbolsAtPhysicalMemoryLocation does not work when queried past end of symbol`, async () => {
        const elf = await load(armelfdata);
        const symbol = getSymbolByName(elf, 'globaldatastring');
        assert(symbol);
        const symbolAddress = virtualAddressToPhysical(elf, symbol.value);
        const symbols = getSymbolsAtPhysicalMemoryLocation(elf, Number(symbolAddress) + Number(symbol.size));
        assert(symbols);
        assert(!(symbols.includes(symbol)));
    });

    test(`getSymbolsAtPhysicalMemoryLocation does not work when queried past beginning of symbol`, async () => {
        const elf = await load(armelfdata);
        const symbol = getSymbolByName(elf, 'globaldatastring');
        assert(symbol);
        const symbolAddress = virtualAddressToPhysical(elf, symbol.value);
        const symbols = getSymbolsAtPhysicalMemoryLocation(elf, Number(symbolAddress) - 1);
        assert(symbols);
        assert(!(symbols.includes(symbol)));
    });

    test(`getSectionsAtVirtualMemoryLocation works when queried at start of section`, async () => {
        const elf = await load(armelfdata);
        const section = getSectionByName(elf, '.text');
        const sections = getSectionsAtVirtualMemoryLocation(elf, Number(section.addr));
        assert(sections);
        assert(sections.includes(section));
    });

    test(`getSectionsAtVirtualMemoryLocation works when queried in middle of section`, async () => {
        const elf = await load(armelfdata);
        const section = getSectionByName(elf, '.text');
        const sections = getSectionsAtVirtualMemoryLocation(elf, Number(section.addr) + 10);
        assert(sections);
        assert(sections.includes(section));
    });

    test(`getSectionsAtVirtualMemoryLocation works when queried at end of section`, async () => {
        const elf = await load(armelfdata);
        const section = getSectionByName(elf, '.text');
        const sections = getSectionsAtVirtualMemoryLocation(elf, Number(section.addr) + Number(section.size) - 1);
        assert(sections);
        assert(sections.includes(section));
    });

    test(`getSectionsAtPhysicalMemoryLocation works when queried at start of section`, async () => {
        const elf = await load(armelfdata);
        const section = getSectionByName(elf, '.text');
        const address = virtualAddressToPhysical(elf, section.addr);
        const sections = getSectionsAtPhysicalMemoryLocation(elf, Number(address));
        assert(sections);
        assert(sections.includes(section));
    });

    test(`getSectionsAtPhysicalMemoryLocation works when queried in middle of section`, async () => {
        const elf = await load(armelfdata);
        const section = getSectionByName(elf, '.text');
        const address = virtualAddressToPhysical(elf, section.addr);
        const sections = getSectionsAtPhysicalMemoryLocation(elf, Number(address) + 10);
        assert(sections);
        assert(sections.includes(section));
    });

    test(`getSectionsAtPhysicalMemoryLocation works when queried at end of section`, async () => {
        const elf = await load(armelfdata);
        const section = getSectionByName(elf, '.text');
        const address = virtualAddressToPhysical(elf, section.addr);
        const sections = getSectionsAtPhysicalMemoryLocation(elf, Number(address) + Number(section.size) - 1);
        assert(sections);
        assert(sections.includes(section));
    });

    test(`getSegmentsAtVirtualMemoryLocation works when queried at start of section`, async () => {
        const elf = await load(armelfdata);
        const segment = elf.segments[0];
        const segments = getSegmentsAtVirtualMemoryLocation(elf, Number(segment.vaddr));
        assert(segments);
        assert(segments.includes(segment));
    });

    test(`getSegmentsAtVirtualMemoryLocation works when queried in middle of section`, async () => {
        const elf = await load(armelfdata);
        const segment = elf.segments[0];
        const segments = getSegmentsAtVirtualMemoryLocation(elf, Number(segment.vaddr) + 10);
        assert(segments);
        assert(segments.includes(segment));
    });

    test(`getSegmentsAtVirtualMemoryLocation works when queried at end of section`, async () => {
        const elf = await load(armelfdata);
        const segment = elf.segments[0];
        const segments = getSegmentsAtVirtualMemoryLocation(elf, Number(segment.vaddr) + Number(segment.memsz) - 1);
        assert(segments);
        assert(segments.includes(segment));
    });

    test(`getSegmentsAtPhysicalMemoryLocation works when queried at start of section`, async () => {
        const elf = await load(armelfdata);
        const segment = elf.segments[0];
        const segments = getSegmentsAtPhysicalMemoryLocation(elf, Number(segment.paddr));
        assert(segments);
        assert(segments.includes(segment));
    });

    test(`getSegmentsAtPhysicalMemoryLocation works when queried in middle of section`, async () => {
        const elf = await load(armelfdata);
        const segment = elf.segments[0];
        const segments = getSegmentsAtPhysicalMemoryLocation(elf, Number(segment.paddr) + 10);
        assert(segments);
        assert(segments.includes(segment));
    });

    test(`getSegmentsAtPhysicalMemoryLocation works when queried at end of section`, async () => {
        const elf = await load(armelfdata);
        const segment = elf.segments[0];
        const segments = getSegmentsAtPhysicalMemoryLocation(elf, Number(segment.paddr) + Number(segment.memsz) - 1);
        assert(segments);
        assert(segments.includes(segment));
    });

    test(`virtualAddressToPhysical works`, async () => {
        const elf = await load(armelfdata);
        // the second segment in ARM has different physical and virtual addresses
        const { vaddr, paddr } = elf.segments[1];
        const testaddr_phys = Number(paddr) + 10;
        const testaddr_virt = Number(vaddr) + 10;
        const result = virtualAddressToPhysical(elf, testaddr_virt);
        assert(result === testaddr_phys);
    });

    test(`virtualAddressToFileOffset works`, async () => {
        const elf = await load(armelfdata);
        const symbol = getSymbolByName(elf, 'globaldatastring')
        assert(symbol);
        const result = virtualAddressToFileOffset(elf, symbol.value);
        assert(result);
        assert(result > Number(elf.segments[0].offset));
        const symbolvalue = armelfdata.slice(Number(result), Number(result) + Number(symbol.size)).toString();
        assert(symbolvalue === 'Hello World #X\0');
    });

    test(`physicalAddressToVirtual works`, async () => {
        const elf = await load(armelfdata);
        // the second segment in ARM has different physical and virtual addresses
        const { vaddr, paddr } = elf.segments[1];
        const testaddr_phys = Number(paddr) + 10;
        const testaddr_virt = Number(vaddr) + 10;
        const result = physicalAddressToVirtual(elf, testaddr_phys);
        assert(result === testaddr_virt);
    });

    test(`physicalAddressToFileOffset works`, async () => {
        const elf = await load(armelfdata);
        const symbol = getSymbolByName(elf, 'globalrodatastring');
        assert(symbol);
        const physicalAddress = virtualAddressToPhysical(elf, symbol.value);
        assert(physicalAddress);
        const result = physicalAddressToFileOffset(elf, physicalAddress);
        assert(result);
        assert(result > Number(elf.segments[0].offset));
        const symbolvalue = armelfdata.slice(Number(result), Number(result) + Number(symbol.size)).toString();
        assert(symbolvalue === 'Hello World\0');
    });

    test(`fileOffsetToPhysicalAddress works`, async () => {
        const elf = await load(armelfdata);
        const symbol = getSymbolByName(elf, 'globalrodatastring');
        assert(symbol);
        const fileOffset = virtualAddressToFileOffset(elf, symbol.value);
        assert(fileOffset);
        const physicalAddress = virtualAddressToPhysical(elf, symbol.value);
        const physicalAddress2 = fileOffsetToPhysicalAddress(elf, fileOffset);
        assert(physicalAddress2 === physicalAddress);
    });

    test(`fileOffsetToVirtualAddress works`, async () => {
        const elf = await load(armelfdata);
        const symbol = getSymbolByName(elf, 'globalrodatastring');
        assert(symbol);
        const fileOffset = virtualAddressToFileOffset(elf, symbol.value);
        assert(fileOffset);
        const virtualAddress = symbol.value;
        const virtualAddress2 = fileOffsetToVirtualAddress(elf, fileOffset);
        assert(virtualAddress2 === virtualAddress2);
    });

    test(`not all virtual addresses have a corresponding physical address`, async () => {
        const elf = await load(armelfdata);
        // BSS section has a virtual address but not physical
        const section = getSectionByName(elf, '.bss');
        const testaddr_virt = Number(section.addr) + 10;
        const result = virtualAddressToPhysical(elf, testaddr_virt);
        assert(!result);
    });

    test(`getSectionByName works`, async () => {
        const elf = await load(elfdata);
        const section = getSectionByName(elf, '.text');
        assert(section);
        assert(section.name === '.text');
    });

    test(`getSectionsByName works`, async () => {
        const elf = await load(elfdata);
        const sections = getSectionsByName(elf, '.text');
        assert(sections);
        assert(sections.length === 1);
        assert(sections[0].name === '.text');
    });

    test(`getSymbolByName works`, async () => {
        const elf = await load(elfdata);
        const sym = getSymbolByName(elf, '__init_array_start');
        assert(sym);
        assert(sym.name === '__init_array_start');
        assert(sym.type === SymbolType.None);
        assert(sym.value > 0);
    });

    test(`getSymbolByName works for dynsym`, async () => {
        const elf = await load(elfdata);
        const sym = getSymbolByName(elf, 'printf');
        assert(sym);
        assert(sym.name === 'printf');
        assert(sym.type === SymbolType.Function);
        assert(Number(sym.value) === 0);
    });
});