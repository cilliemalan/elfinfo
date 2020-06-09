import * as fs from 'fs';
import * as path from 'path';

const basepath = path.resolve(path.join(__dirname, '..', 'testprograms'));

const objects = ['factorial', 'main', 'startup', 'syscalls', 'vectortable'];
const abis = ['arm-eabi', 'clang-x64', 'gcc-x64', 'riscv-eabi'];

function progpath(abi: string) {
    return path.resolve(path.join(basepath, 'bin', abi, 'program'));
}

function objpaths(abi: string) {
    return objects.map(object => path.resolve(path.join(basepath, 'obj', abi, `${object}.o`)));
}

function abiobjects() {
    const result: { [abi: string]: { objects: string[]; program: string; } } = {};
    const abimap = abis.map(abi => ({ abi, vals: { objects: objpaths(abi), program: progpath(abi) } }));
    for (const { abi, vals } of abimap) {
        result[abi] = vals;
    }
    return result;
}

export const testprograms = {
    ...abiobjects()
}
