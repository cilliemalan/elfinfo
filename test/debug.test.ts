import request from "supertest";
import * as elfinfo from "../src";
import {testprograms} from './testprograms';
import { debug } from "../src";

describe("Debug", () => {

    it(`should produce output for executable ELF`, async () => {
        const elf = await elfinfo.open(testprograms['clang-x64'].program);
        const output = debug(elf.elf);
        expect(output).not.toBeNull();
        expect(output.length).toBeGreaterThan(0);
    });
    
    it(`should produce output for object ELF`, async () => {
        const elf = await elfinfo.open(testprograms['clang-x64'].objects[0]);
        const output = debug(elf.elf);
        expect(output).not.toBeNull();
        expect(output.length).toBeGreaterThan(0);
    });
    
    it(`should produce output for ELFOpenResult`, async () => {
        const elf = await elfinfo.open(testprograms['arm-eabi'].program);
        const output = debug(elf);
        expect(output).not.toBeNull();
        expect(output.length).toBeGreaterThan(0);
    });
});
