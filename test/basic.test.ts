import request from "supertest";
import * as elfinfo from "../src";
import {testprograms} from './testprograms';

describe("Basic Operations", () => {

    Object.keys(testprograms)
        .forEach(abi => {
            it(`${abi} program should open without problems`, async () => {
                const elf = await elfinfo.open(testprograms[abi].program);
                expect(elf.success).toBe(true);
                expect(elf.errors.length).toBe(0);
                expect(elf.warnings.length).toBe(0);
            });
        })

});
