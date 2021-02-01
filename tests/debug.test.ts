import assert from 'assert';
import { debug, open } from "../src";
import { testPrograms } from './testprograms';
import { category, test } from './';

category("Debug", () => {

    test(`should produce output for executable ELF`, async () => {
        const elf = await open(testPrograms['clang-x64'].program);
        assert(elf);
        assert(elf.elf);
        const output = debug(elf.elf);
        assert(output);
        assert(output.length > 0);
    });

    test(`should produce output for object ELF`, async () => {
        const elf = await open(testPrograms['clang-x64'].objects[0]);
        assert(elf);
        assert(elf.elf);
        const output = debug(elf.elf);
        assert(output);
        assert(output.length > 0);
    });

    test(`should produce output for ELFOpenResult`, async () => {
        const elf = await open(testPrograms['arm-eabi'].program);
        assert(elf);
        assert(elf.elf);
        const output = debug(elf);
        assert(output)
        assert(output.length > 0);
    });
});
