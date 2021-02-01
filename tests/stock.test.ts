import assert from 'assert';
import * as elfinfo from "../src";
import { stockprograms } from './testprograms';
import { category, test } from './';

category("Stock Programs", () => {

    Object.keys(stockprograms)
        .forEach(name => {
            const { program, abi, programName } = stockprograms[name];
            elfinfo.open(program).then(elf => {
                elf.warnings.forEach(w => console.warn(w));
                elf.errors.forEach(e => console.error(e));

                test(`${programName} (${abi}) should open without problems`, async () => {
                    assert(elf.success === true);
                    assert(elf.errors.length === 0);
                    assert(elf.warnings.length === 0);
                });

                test(`${programName} (${abi}) should have sections`, async () => {
                    assert(elf.elf);
                    assert(elf.elf.sections.length > 0);
                });

                test(`${programName} (${abi}) should have segments`, async () => {
                    assert(elf.elf);
                    assert(elf.elf.segments.length > 0);
                });

                const symbols = elf.elf && elfinfo.getSymbols(elf.elf);
                test(`${programName} (${abi}) should have symbols`, async () => {
                    assert(symbols);
                });
                
                test(`${programName} (${abi}) should have a main symbol`, async () => {
                    let main_symbol_found = false;
                    assert(symbols);
                    for(const symbol of symbols) {
                        if (/_?main/.test(symbol.name)) {
                            main_symbol_found = true;
                            break;
                        }
                    }
                    assert(main_symbol_found);
                });
            });
        })
});
