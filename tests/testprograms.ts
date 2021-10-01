import * as fs from 'fs';
import * as path from 'path';

export type StockProgramAbi = 'alpha' | 'amd64' | 'armhf' | 'hppa' |
    'hurd' | 'i386' | 'ia64' | 'm68k' | 'powerpc' | 'ppc64' |
    'riscv64' | 'sh4' | 'sparc64' | 'x32';
export type StockProgram = 'cat' | 'date';
export type TestProgramObject = 'factorial' | 'main' | 'startup' | 'syscalls' | 'vectortable';
export type TestProgramAbi = 'arm-eabi' | 'clang-x64' | 'gcc-x64' | 'riscv-eabi';

export type Blah = keyof number;

export interface ProgramDataDetail {
    objects: Uint8Array[];
    objectPaths: string[];
    program: Uint8Array;
    programPath: string;
}

export type ProgramData = {
    [Property in TestProgramAbi]: ProgramDataDetail
}

export interface StockProgramDetail {
    name: StockProgram;
    abi: StockProgramAbi;
    program: Uint8Array;
    programPath: string;
}

export type StockProgramByAbi = {
    [Property in StockProgramAbi]: StockProgramDetail
}

export type StockProgramData = {
    [Property in StockProgram]: StockProgramByAbi
}

export interface SpecialProgram {
    name: string;
    path: string;
}

const basepath = path.resolve(path.join(__dirname, '..', '..', 'testprograms'));
export const testProgramObjects: TestProgramObject[] = ['factorial', 'main', 'startup', 'syscalls', 'vectortable'];
export const testProgramAbis: TestProgramAbi[] = ['arm-eabi', 'clang-x64', 'gcc-x64', 'riscv-eabi'];
export const stockProgramNames: StockProgram[] = ['cat', 'date'];
export const stockProgramAbis: StockProgramAbi[] = ['alpha', 'amd64', 'armhf', 'hppa',
    'hurd', 'i386', 'ia64', 'm68k', 'powerpc', 'ppc64', 'riscv64', 'sh4', 'sparc64', 'x32'];

function progpath(abi: string) {
    return path.resolve(path.join(basepath, 'bin', abi, 'program'));
}

function objpaths(abi: string) {
    return testProgramObjects.map(object => path.resolve(path.join(basepath, 'obj', abi, `${object}.o`)));
}

function read(path: string): Uint8Array {
    return fs.readFileSync(path);
}

function getTestPrograms() {
    return Object.fromEntries(testProgramAbis.map(abi => ({
        abi,
        vals: {
            objectPaths: objpaths(abi),
            programPath: progpath(abi)
        }
    })).map(({ abi, vals: { objectPaths, programPath } }) => [abi, {
        objectPaths: objectPaths,
        objects: objectPaths.map(read),
        programPath: programPath,
        program: read(programPath),
    }])) as ProgramData;
}

function getStockPrograms() {
    return Object.fromEntries(stockProgramNames.map(name =>
        [name, Object.fromEntries(stockProgramAbis.map(abi => {
            const programPath = path.join(basepath, 'stock', `${name}_${abi}`);
            return [abi, {
                name,
                abi,
                program: read(programPath),
                programPath
            }];
        }))])) as StockProgramData;
}

function getSpecialPrograms(): SpecialProgram[] {
    const dir = path.join(basepath, 'special');
    return fs.readdirSync(dir)
        .map(n => ({ name: n, path: path.join(dir, n) }));
}

export const testPrograms = getTestPrograms();
export const stockPrograms = getStockPrograms();
export const specialPrograms = getSpecialPrograms();