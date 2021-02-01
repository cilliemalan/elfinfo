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

export interface StockProgramData {
    [name: string]: {
        abi: string;
        program: Uint8Array;
        programPath: string;
        programName: string;
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

function getstockprograms() {
    const programs = [
        'cat_alpha',
        'cat_amd64',
        'cat_armhf',
        'cat_hppa',
        'cat_hurd',
        'cat_i386',
        'cat_ia64',
        'cat_m68k',
        'cat_powerpc',
        'cat_ppc64',
        'cat_riscv64',
        'cat_sh4',
        'cat_sparc64',
        'cat_x32',
        'date_alpha',
        'date_amd64',
        'date_armhf',
        'date_hppa',
        'date_hurd',
        'date_i386',
        'date_ia64',
        'date_m68k',
        'date_powerpc',
        'date_ppc64',
        'date_riscv64',
        'date_sh4',
        'date_sparc64',
        'date_x32',
    ];

    const result : StockProgramData= {};

    const allprograms = programs.map(name => {
        const programPath = path.join(basepath, 'stock', name);
        const [, programName, abi] = name.match(/^(.+?)_(.+)$/) as string[];
        const program: Uint8Array = fs.readFileSync(programPath);
        return { name, programName, programPath, abi, program };
    });

    for(const data of allprograms) {
        result[data.name] = data;
    }

    return result;
}

export const testprograms = abiobjects();

export const stockprograms = getstockprograms();
