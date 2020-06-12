import request from "supertest";
import * as elfinfo from "../src";
import {testprograms} from './testprograms';

describe("Basic Operations", () => {

    Object.keys(testprograms)
        .forEach(abi => {
            it(`${abi} program should open without problems`, async () => {
                const elf = await elfinfo.open(testprograms[abi].program);
                elf.warnings.forEach(w => console.warn(w));
                elf.errors.forEach(e => console.error(e));
                expect(elf.success).toBe(true);
                expect(elf.errors.length).toBe(0);
                expect(elf.warnings.length).toBe(0);
            });

            it(`${abi} objects should open without problems`, async () => {
                for(const object of testprograms[abi].objects) {
                    const elf = await elfinfo.open(object);
                    elf.warnings.forEach(w => console.warn(w));
                    elf.errors.forEach(e => console.error(e));
                    expect(elf.success).toBe(true);
                    expect(elf.errors.length).toBe(0);
                    expect(elf.warnings.length).toBe(0);
                }
            });
        });

});
