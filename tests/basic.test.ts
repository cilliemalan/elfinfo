import assert from 'assert';
import * as elfinfo from "../src";
import { testPrograms, testProgramAbis } from './testprograms';
import { category, test } from './';

category("Basic Operations", () => {

    testProgramAbis.forEach(abi => {
        test(`${abi} program should open without problems`, async () => {
            const elf = await elfinfo.open(testPrograms[abi].program);
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
            for (const object of testPrograms[abi].objects) {
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
