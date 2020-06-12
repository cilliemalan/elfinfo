import request from "supertest";
import * as elfinfo from "../src";
import * as fs from "fs";
import { testprograms } from './testprograms';
import { ELF, SymbolType } from "../src";

async function load(path: string) : Promise<ELF> {
    const elf = await elfinfo.open(path);
    elf.warnings.forEach(w => console.warn(w));
    elf.errors.forEach(e => console.error(e));
    expect(elf.success).toBe(true);
    return elf.elf;
}

describe("Functions", () => {

    const path = testprograms['clang-x64'].program;
    const armpath = testprograms['arm-eabi'].program;

    it(`getSymbols works`, async () => {
        const elf = await load(path);
        const allsyms = elf.getSymbols();
        expect(allsyms).not.toBeNull();
        expect(allsyms.length).toBeGreaterThan(0);
        expect(allsyms.filter(x=>x.name == 'main.cpp').length).toBe(1);
        expect(allsyms.filter(x=>x.name == '__init_array_end').length).toBe(1);
        expect(allsyms.filter(x=>x.name == '_Z10factorialff').length).toBe(1);
        expect(allsyms.filter(x=>x.name == 'printf').length).toBe(1);
    });

    it(`getSymbolsInSection (section) works`, async () => {
        const elf = await load(path);
        const section = elf.getSectionByName('.text');
        const syms = elf.getSymbolsInSection(section);
        expect(syms).not.toBeNull();
        expect(syms.length).toBeGreaterThan(0);
        expect(syms.filter(x=>x.name == '_Z10factorialff').length).not.toBe(0);
    });

    it(`getSymbolsInSection (index) works`, async () => {
        const elf = await load(path);
        const section = elf.getSectionByName('.text');
        const syms = elf.getSymbolsInSection(section.index);
        expect(syms).not.toBeNull();
        expect(syms.length).toBeGreaterThan(0);
        expect(syms.filter(x=>x.name == 'main').length).not.toBe(0);
    });

    it(`getSymbolsInSegment (segment) works`, async () => {
        const elf = await load(path);
        const syms = elf.getSymbolsInSegment(elf.segments[2]);
        expect(syms).not.toBeNull();
        expect(syms.length).toBeGreaterThan(0);
        expect(syms.filter(x=>x.name == 'main').length).not.toBe(0);
    });

    it(`getSymbolsInSegment (index) works`, async () => {
        const elf = await load(path);
        const syms = elf.getSymbolsInSegment(2);
        expect(syms).not.toBeNull();
        expect(syms.length).toBeGreaterThan(0);
        expect(syms.filter(x=>x.name == '_Z10factorialff').length).not.toBe(0);
    });

    it(`getSectionsInSegment works`, async () => {
        const elf = await load(path);
        const sections1 = elf.getSectionsInSegment(2);
        expect(sections1).not.toBeNull();
        expect(sections1.length).toBeGreaterThan(0);
        expect(sections1.filter(x=>x.name == '.text').length).not.toBe(0);
        const sections2 = elf.getSectionsInSegment(3);
        expect(sections2).not.toBeNull();
        expect(sections2.length).toBeGreaterThan(0);
        expect(sections2.filter(x=>x.name == '.bss').length).not.toBe(0);
    });

    it(`getSectionForSymbol works`, async () => {
        const elf = await load(path);
        const symbol = elf.getSymbolByName('main');
        const section = elf.getSectionForSymbol(symbol);
        expect(section).not.toBeNull();
        expect(section.name).toBe('.text');
    });

    it(`getSegmentForSymbol works`, async () => {
        const elf = await load(path);
        const symbol = elf.getSymbolByName('main');
        const segment = elf.getSegmentForSymbol(symbol);
        expect(segment).not.toBeNull();
        expect(segment.index).toBe(2);
    });

    it(`getSymbolsAtVirtualMemoryLocation works when queried at start of symbol`, async () => {
        const elf = await load(armpath);
        const symbol = elf.getSymbolByName('errno');
        const symbols = elf.getSymbolsAtVirtualMemoryLocation(Number(symbol.value));
        expect(symbols).not.toBeNull();
        expect(symbols.length).toBeGreaterThan(0);
        expect(symbols.includes(symbol)).toBeTruthy();
    });

    it(`getSymbolsAtVirtualMemoryLocation works when queried in middle of symbol`, async () => {
        const elf = await load(armpath);
        const symbol = elf.getSymbolByName('errno');
        const symbols = elf.getSymbolsAtVirtualMemoryLocation(Number(symbol.value) + 2);
        expect(symbols).not.toBeNull();
        expect(symbols.length).toBeGreaterThan(0);
        expect(symbols.includes(symbol)).toBeTruthy();
    });

    it(`getSymbolsAtVirtualMemoryLocation works when queried on last byte of symbol`, async () => {
        const elf = await load(armpath);
        const symbol = elf.getSymbolByName('errno');
        const symbols = elf.getSymbolsAtVirtualMemoryLocation(Number(symbol.value) + Number(symbol.size) - 1);
        expect(symbols).not.toBeNull();
        expect(symbols.length).toBeGreaterThan(0);
        expect(symbols.includes(symbol)).toBeTruthy();
    });

    it(`getSymbolsAtVirtualMemoryLocation does not work when queried past end of symbol`, async () => {
        const elf = await load(armpath);
        const symbol = elf.getSymbolByName('errno');
        const symbols = elf.getSymbolsAtVirtualMemoryLocation(Number(symbol.value) + Number(symbol.size));
        expect(symbols).not.toBeNull();
        expect(symbols.includes(symbol)).toBeFalsy();
    });

    it(`getSymbolsAtVirtualMemoryLocation does not work when queried past beginning of symbol`, async () => {
        const elf = await load(armpath);
        const symbol = elf.getSymbolByName('errno');
        const symbols = elf.getSymbolsAtVirtualMemoryLocation(Number(symbol.value) - 1);
        expect(symbols).not.toBeNull();
        expect(symbols.includes(symbol)).toBeFalsy();
    });

    it(`getSymbolsAtPhysicalMemoryLocation works when queried at start of symbol`, async () => {
        const elf = await load(armpath);
        const symbol = elf.getSymbolByName('globaldatastring');
        const symbolAddress = elf.virtualAddressToPhysical(symbol.value);
        const symbols = elf.getSymbolsAtPhysicalMemoryLocation(symbolAddress);
        expect(symbols).not.toBeNull();
        expect(symbols.length).toBeGreaterThan(0);
        expect(symbols.includes(symbol)).toBeTruthy();
    });

    it(`getSymbolsAtPhysicalMemoryLocation works when queried in middle of symbol`, async () => {
        const elf = await load(armpath);
        const symbol = elf.getSymbolByName('globaldatastring');
        const symbolAddress = elf.virtualAddressToPhysical(symbol.value);
        const symbols = elf.getSymbolsAtPhysicalMemoryLocation(Number(symbolAddress) + 2);
        expect(symbols).not.toBeNull();
        expect(symbols.length).toBeGreaterThan(0);
        expect(symbols.includes(symbol)).toBeTruthy();
    });

    it(`getSymbolsAtPhysicalMemoryLocation works when queried on last byte of symbol`, async () => {
        const elf = await load(armpath);
        const symbol = elf.getSymbolByName('globaldatastring');
        const symbolAddress = elf.virtualAddressToPhysical(symbol.value);
        const symbols = elf.getSymbolsAtPhysicalMemoryLocation(Number(symbolAddress) + Number(symbol.size) - 1);
        expect(symbols).not.toBeNull();
        expect(symbols.length).toBeGreaterThan(0);
        expect(symbols.includes(symbol)).toBeTruthy();
    });

    it(`getSymbolsAtPhysicalMemoryLocation does not work when queried past end of symbol`, async () => {
        const elf = await load(armpath);
        const symbol = elf.getSymbolByName('globaldatastring');
        const symbolAddress = elf.virtualAddressToPhysical(symbol.value);
        const symbols = elf.getSymbolsAtPhysicalMemoryLocation(Number(symbolAddress) + Number(symbol.size));
        expect(symbols).not.toBeNull();
        expect(symbols.includes(symbol)).toBeFalsy();
    });

    it(`getSymbolsAtPhysicalMemoryLocation does not work when queried past beginning of symbol`, async () => {
        const elf = await load(armpath);
        const symbol = elf.getSymbolByName('globaldatastring');
        const symbolAddress = elf.virtualAddressToPhysical(symbol.value);
        const symbols = elf.getSymbolsAtPhysicalMemoryLocation(Number(symbolAddress) - 1);
        expect(symbols).not.toBeNull();
        expect(symbols.includes(symbol)).toBeFalsy();
    });
    
    it(`getSectionsAtVirtualMemoryLocation works when queried at start of section`, async () => {
        const elf = await load(armpath);
        const section = elf.getSectionByName('.text');
        const sections = elf.getSectionsAtVirtualMemoryLocation(Number(section.addr));
        expect(sections).not.toBeNull();
        expect(sections.includes(section)).toBeTruthy();
    });

    it(`getSectionsAtVirtualMemoryLocation works when queried in middle of section`, async () => {
        const elf = await load(armpath);
        const section = elf.getSectionByName('.text');
        const sections = elf.getSectionsAtVirtualMemoryLocation(Number(section.addr) + 10);
        expect(sections).not.toBeNull();
        expect(sections.includes(section)).toBeTruthy();
    });

    it(`getSectionsAtVirtualMemoryLocation works when queried at end of section`, async () => {
        const elf = await load(armpath);
        const section = elf.getSectionByName('.text');
        const sections = elf.getSectionsAtVirtualMemoryLocation(Number(section.addr) + Number(section.size) - 1);
        expect(sections).not.toBeNull();
        expect(sections.includes(section)).toBeTruthy();
    });
    
    it(`getSectionsAtPhysicalMemoryLocation works when queried at start of section`, async () => {
        const elf = await load(armpath);
        const section = elf.getSectionByName('.text');
        const address = elf.virtualAddressToPhysical(section.addr);
        const sections = elf.getSectionsAtPhysicalMemoryLocation(Number(address));
        expect(sections).not.toBeNull();
        expect(sections.includes(section)).toBeTruthy();
    });

    it(`getSectionsAtPhysicalMemoryLocation works when queried in middle of section`, async () => {
        const elf = await load(armpath);
        const section = elf.getSectionByName('.text');
        const address = elf.virtualAddressToPhysical(section.addr);
        const sections = elf.getSectionsAtPhysicalMemoryLocation(Number(address) + 10);
        expect(sections).not.toBeNull();
        expect(sections.includes(section)).toBeTruthy();
    });

    it(`getSectionsAtPhysicalMemoryLocation works when queried at end of section`, async () => {
        const elf = await load(armpath);
        const section = elf.getSectionByName('.text');
        const address = elf.virtualAddressToPhysical(section.addr);
        const sections = elf.getSectionsAtPhysicalMemoryLocation(Number(address) + Number(section.size) - 1);
        expect(sections).not.toBeNull();
        expect(sections.includes(section)).toBeTruthy();
    });
    
    it(`getSegmentsAtVirtualMemoryLocation works when queried at start of section`, async () => {
        const elf = await load(armpath);
        const segment = elf.segments[0];
        const segments = elf.getSegmentsAtVirtualMemoryLocation(Number(segment.vaddr));
        expect(segments).not.toBeNull();
        expect(segments.includes(segment)).toBeTruthy();
    });

    it(`getSegmentsAtVirtualMemoryLocation works when queried in middle of section`, async () => {
        const elf = await load(armpath);
        const segment = elf.segments[0];
        const segments = elf.getSegmentsAtVirtualMemoryLocation(Number(segment.vaddr) + 10);
        expect(segments).not.toBeNull();
        expect(segments.includes(segment)).toBeTruthy();
    });

    it(`getSegmentsAtVirtualMemoryLocation works when queried at end of section`, async () => {
        const elf = await load(armpath);
        const segment = elf.segments[0];
        const segments = elf.getSegmentsAtVirtualMemoryLocation(Number(segment.vaddr) + Number(segment.memsz) - 1);
        expect(segments).not.toBeNull();
        expect(segments.includes(segment)).toBeTruthy();
    });
    
    it(`getSegmentsAtPhysicalMemoryLocation works when queried at start of section`, async () => {
        const elf = await load(armpath);
        const segment = elf.segments[0];
        const segments = elf.getSegmentsAtPhysicalMemoryLocation(Number(segment.paddr));
        expect(segments).not.toBeNull();
        expect(segments.includes(segment)).toBeTruthy();
    });

    it(`getSegmentsAtPhysicalMemoryLocation works when queried in middle of section`, async () => {
        const elf = await load(armpath);
        const segment = elf.segments[0];
        const segments = elf.getSegmentsAtPhysicalMemoryLocation(Number(segment.paddr) + 10);
        expect(segments).not.toBeNull();
        expect(segments.includes(segment)).toBeTruthy();
    });

    it(`getSegmentsAtPhysicalMemoryLocation works when queried at end of section`, async () => {
        const elf = await load(armpath);
        const segment = elf.segments[0];
        const segments = elf.getSegmentsAtPhysicalMemoryLocation(Number(segment.paddr) + Number(segment.memsz) - 1);
        expect(segments).not.toBeNull();
        expect(segments.includes(segment)).toBeTruthy();
    });

    it(`virtualAddressToPhysical works`, async () => {
        const elf = await load(armpath);
        // the second segment in ARM has different physical and virtual addresses
        const {vaddr, paddr} = elf.segments[1];
        const testaddr_phys = Number(paddr) + 10;
        const testaddr_virt = Number(vaddr) + 10;
        const result = elf.virtualAddressToPhysical(testaddr_virt);
        expect(result).toBe(testaddr_phys);
    });

    it(`virtualAddressToFileOffset works`, async () => {
        const elf = await load(armpath);
        const symbol = elf.getSymbolByName('globaldatastring')
        const result = elf.virtualAddressToFileOffset(symbol.value);
        expect(result).not.toBeNull();
        expect(result).toBeGreaterThan(Number(elf.segments[0].offset));
        const symbolvalue = fs.readFileSync(armpath).slice(Number(result), Number(result) + Number(symbol.size)).toString();
        expect(symbolvalue).toBe('Hello World #X\0');
    });

    it(`physicalAddressToVirtual works`, async () => {
        const elf = await load(armpath);
        // the second segment in ARM has different physical and virtual addresses
        const {vaddr, paddr} = elf.segments[1];
        const testaddr_phys = Number(paddr) + 10;
        const testaddr_virt = Number(vaddr) + 10;
        const result = elf.physicalAddressToVirtual(testaddr_phys);
        expect(result).toBe(testaddr_virt);
    });

    it(`physicalAddressToFileOffset works`, async () => {
        const elf = await load(armpath);
        const symbol = elf.getSymbolByName('globalrodatastring');
        const physicalAddress = elf.virtualAddressToPhysical(symbol.value);
        const result = elf.physicalAddressToFileOffset(physicalAddress);
        expect(result).not.toBeNull();
        expect(result).toBeGreaterThan(Number(elf.segments[0].offset));
        const symbolvalue = fs.readFileSync(armpath).slice(Number(result), Number(result) + Number(symbol.size)).toString();
        expect(symbolvalue).toBe('Hello World\0');
    });

    it(`fileOffsetToPhysicalAddress works`, async () => {
        const elf = await load(armpath);
        const symbol = elf.getSymbolByName('globalrodatastring');
        const fileOffset = elf.virtualAddressToFileOffset(symbol.value);
        const physicalAddress = elf.virtualAddressToPhysical(symbol.value);
        const physicalAddress2 = elf.fileOffsetToPhysicalAddress(fileOffset);
        expect(physicalAddress2).toBe(physicalAddress);
    });

    it(`fileOffsetToVirtualAddress works`, async () => {
        const elf = await load(armpath);
        const symbol = elf.getSymbolByName('globalrodatastring');
        const fileOffset = elf.virtualAddressToFileOffset(symbol.value);
        const virtualAddress = symbol.value;
        const virtualAddress2 = elf.fileOffsetToVirtualAddress(fileOffset);
        expect(virtualAddress2).toBe(virtualAddress2);
    });

    it(`not all virtual addresses have a corresponding physical address`, async () => {
        const elf = await load(armpath);
        // BSS section has a virtual address but not physical
        const section = elf.getSectionByName('.bss');
        const testaddr_virt = Number(section.addr) + 10;
        const result = elf.virtualAddressToPhysical(testaddr_virt);
        expect(result).toBeNull();
    });

    it(`getSectionByName works`, async () => {
        const elf = await load(path);
        const section = elf.getSectionByName('.text');
        expect(section).not.toBeNull();
        expect(section.name).toBe('.text');
    });

    it(`getSectionsByName works`, async () => {
        const elf = await load(path);
        const sections = elf.getSectionsByName('.text');
        expect(sections).not.toBeNull();
        expect(sections.length).toBe(1);
        expect(sections[0].name).toBe('.text');
    });

    it(`getSymbolByName works`, async () => {
        const elf = await load(path);
        const sym = elf.getSymbolByName('__init_array_start');
        expect(sym).not.toBeNull();
        expect(sym.name).toBe('__init_array_start');
        expect(sym.type).toBe(SymbolType.None);
        expect(sym.value).toBeGreaterThan(0);
    });

    it(`getSymbolByName works for dynsym`, async () => {
        const elf = await load(path);
        const sym = elf.getSymbolByName('printf');
        expect(sym).not.toBeNull();
        expect(sym.name).toBe('printf');
        expect(sym.type).toBe(SymbolType.Function);
        expect(Number(sym.value)).toBe(0);
    });
});