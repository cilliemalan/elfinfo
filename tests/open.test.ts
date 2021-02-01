import assert from 'assert';
import * as elfinfo from "../src";
import fs from "fs";
import { testPrograms } from './testprograms';
import { category, test } from './';

category("Open types", () => {

    const data = testPrograms['clang-x64'].program;
    const path = testPrograms['clang-x64'].programPath;

    test(`should open a buffer without problems`, async () => {
        const fh = await fs.promises.open(path, 'r');
        const buffer = await fh.readFile();
        await fh.close();
        const elf = await elfinfo.open(buffer);
        elf.warnings.forEach(w => console.warn(w));
        elf.errors.forEach(e => console.error(e));
        assert(elf.success === true);
        assert(elf.errors.length === 0);
        assert(elf.warnings.length === 0);
    });

    test(`should open an ArrayBuffer without problems`, async () => {
        const fh = await fs.promises.open(path, 'r');
        const buffer = await fh.readFile();
        await fh.close();
        const elf = await elfinfo.open(buffer.buffer.slice(buffer.byteOffset, buffer.byteLength));
        elf.warnings.forEach(w => console.warn(w));
        elf.errors.forEach(e => console.error(e));
        assert(elf.success === true);
        assert(elf.errors.length === 0);
        assert(elf.warnings.length === 0);
    });

    test(`should open a structured array without problems`, async () => {
        const elf = await elfinfo.open(data);
        elf.warnings.forEach(w => console.warn(w));
        elf.errors.forEach(e => console.error(e));
        assert(elf.success === true);
        assert(elf.errors.length === 0);
        assert(elf.warnings.length === 0);
    });

    test(`should open an ustructured array without problems`, async () => {
        const fh = await fs.promises.open(path, 'r');
        const buffer = await fh.readFile();
        await fh.close();
        
        const elf = await elfinfo.open(Array.from(data));
        elf.warnings.forEach(w => console.warn(w));
        elf.errors.forEach(e => console.error(e));
        assert(elf.success === true);
        assert(elf.errors.length === 0);
        assert(elf.warnings.length === 0);
    });
});
