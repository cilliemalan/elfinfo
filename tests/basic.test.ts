import assert from 'assert';
import * as elfinfo from "../src";
import { testprograms } from './testprograms';
import { category, test } from './';

category("Basic Operations", () => {

    Object.keys(testprograms)
        .forEach(abi => {
            test(`${abi} program should open without problems`, async () => {
                const elf = await elfinfo.open(testprograms[abi].program);
                elf.warnings.forEach(w => console.warn(w));
                elf.errors.forEach(e => console.error(e));
                assert(elf.success === true);
                assert(elf.errors.length === 0);
                assert(elf.warnings.length === 0);
                assert(elf.elf);
                assert(elf.elf.sections.length > 0);
                assert(elf.elf.segments.length > 0);
            });

            test(`${abi} objects should open without problems`, async () => {
                for (const object of testprograms[abi].objects) {
                    const elf = await elfinfo.open(object);
                    elf.warnings.forEach(w => console.warn(w));
                    elf.errors.forEach(e => console.error(e));
                    assert(elf.success === true);
                    assert(elf.errors.length === 0);
                    assert(elf.warnings.length === 0);
                    assert(elf.elf);
                    assert(elf.elf.sections.length > 0);
                }
            });
        });
});
