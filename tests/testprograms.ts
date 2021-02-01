import * as fs from 'fs';
import * as path from 'path';

const basepath = path.resolve(path.join(__dirname, '..', '..', 'testprograms'));

const objects = ['factorial', 'main', 'startup', 'syscalls', 'vectortable'];
const abis = ['arm-eabi', 'clang-x64', 'gcc-x64', 'riscv-eabi'];

export interface ProgramData {
    [abi: string]: {
        objects: Uint8Array[];
        objectPaths: string[];
        program: Uint8Array;
        programPath: string;
    }
}

function progpath(abi: string) {
    return path.resolve(path.join(basepath, 'bin', abi, 'program'));
}

function objpaths(abi: string) {
    return objects.map(object => path.resolve(path.join(basepath, 'obj', abi, `${object}.o`)));
}

function read(path: string): Uint8Array {
    return fs.readFileSync(path);
}

function abiobjects() {
    const result: ProgramData = {};
    
    const abimap = abis.map(abi => ({ abi, vals: { objectPaths: objpaths(abi), programPath: progpath(abi) } }));
    
    for (const { abi, vals: { objectPaths, programPath } } of abimap) {
        result[abi] = {
            objectPaths: objectPaths,
            objects: objectPaths.map(read),
            programPath: programPath,
            program: read(programPath),
        };
    }
    return result;
}

export const testprograms = {
    ...abiobjects()
}
