import request from "supertest";
import * as elfinfo from "../src";
import * as fs from "fs";
import { testprograms } from './testprograms';

describe("Open types", () => {

    const path = testprograms['clang-x64'].program;

    it(`should open a path without problems`, async () => {
        const elf = await elfinfo.open(path);
        expect(elf.success).toBe(true);
        expect(elf.errors.length).toBe(0);
        expect(elf.warnings.length).toBe(0);
    });

    it(`should open a sync file handle without problems`, async () => {
        const fh = fs.openSync(path, 'r');
        const elf = await elfinfo.open(fh);
        fs.closeSync(fh);
        expect(elf.success).toBe(true);
        expect(elf.errors.length).toBe(0);
        expect(elf.warnings.length).toBe(0);
    });

    it(`should open an async file handle without problems`, async () => {
        const fh = await fs.promises.open(path, 'r');
        const elf = await elfinfo.open(fh);
        await fh.close();
        expect(elf.success).toBe(true);
        expect(elf.errors.length).toBe(0);
        expect(elf.warnings.length).toBe(0);
    });

    it(`should open a buffer without problems`, async () => {
        const fh = await fs.promises.open(path, 'r');
        const buffer = await fh.readFile();
        await fh.close();
        const elf = await elfinfo.open(buffer);
        expect(elf.success).toBe(true);
        expect(elf.errors.length).toBe(0);
        expect(elf.warnings.length).toBe(0);
    });
});
