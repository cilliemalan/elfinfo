import assert from 'assert';
import * as elfinfo from "../src";
import { specialPrograms } from './testprograms';
import { category, test } from './';

category("Special Programs", async () => {

    test('There should be special programs', () => assert.ok(specialPrograms.length));

    await Promise.all(specialPrograms.map<Promise<void>>(async ({ name, path }) => {

        const elf = await elfinfo.open(path);
        console.log({ name, path });

        elf.warnings.forEach(w => console.warn(w));
        elf.errors.forEach(e => console.error(e));

        test(`${name} should open without problems`, async () => {
            assert(elf.success === true);
            assert(elf.errors.length === 0);
            assert(elf.warnings.length === 0);
        });

        test(`${name} should have sections`, async () => {
            assert(elf.elf);
            assert(elf.elf.sections.length > 0);
        });

        test(`${name} should have segments`, async () => {
            assert(elf.elf);
            assert(elf.elf.segments.length > 0);
        });

        const symbols = elf.elf && elfinfo.getSymbols(elf.elf);
        test(`${name} should have symbols`, async () => {
            assert(symbols);
        });

        test(`${name} should have a main symbol`, async () => {
            let main_symbol_found = false;
            assert(symbols);
            for (const symbol of symbols) {
                if (/_?main/.test(symbol.name)) {
                    main_symbol_found = true;
                    break;
                }
            }
            assert(main_symbol_found);
        });
    }));
});