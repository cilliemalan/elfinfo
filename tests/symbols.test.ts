import assert from 'assert';
import { debug, getSymbols, open, SectionHeaderEntryType, SymbolType } from "../src";
import { testPrograms } from './testprograms';
import { category, test } from './';

category("Symbols", () => {

    test(`data should be undefined by default`, async () => {
        const elf = await open(testPrograms['clang-x64'].program)
        assert(elf);
        assert(elf.elf);
        const symbols = getSymbols(elf.elf);
        symbols.forEach(x => assert(x.data === undefined));
    });

    test(`data should be loaded for some symbols if specified`, async () => {
        const elf = await open(testPrograms['clang-x64'].program, { readSymbolData: true });
        assert(elf);
        assert(elf.elf);
        const symbols = getSymbols(elf.elf);
        assert(symbols && symbols.length);
        let symbolsWithData = 0;
        symbols.forEach(x => symbolsWithData += x.data ? 1 : 0);
        assert(symbolsWithData !== 0);
    });

    test(`all symbols with data should be loaded`, async () => {
        const elf = await open(testPrograms['clang-x64'].program, { readSymbolData: true });
        assert(elf);
        assert(elf.elf);
        const symbols = getSymbols(elf.elf);
        assert(symbols && symbols.length);
        let symbolDataLengthTotal = 0;
        let symbolSizeTotal = 0;
        symbols.forEach(x => {
            if (x.type === SymbolType.Object || x.type === SymbolType.Function) {
                if (elf.elf && x.shndx < elf.elf.sections.length &&
                    elf.elf.sections[x.shndx].type != SectionHeaderEntryType.NoBits) {
                    symbolSizeTotal += Number(x.size);
                }
            }

            if (x.data) {
                symbolDataLengthTotal += x.data.length;
            }
        });
        assert(symbolDataLengthTotal === symbolSizeTotal);
    });
});
