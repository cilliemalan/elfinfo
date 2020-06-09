import * as fs from "fs";
import {ElfProgramHeaderEntry} from './types';


export async function readProgramHeaderEntries(fh: fs.promises.FileHandle,
    ph_off: number | BigInt, ph_entsize: number, ph_num: number,
    bits: number, bigEndian: boolean): Promise<ElfProgramHeaderEntry[]> {

    if (ph_num == 0) {
        return [];
    }

    const buff = Buffer.alloc(ph_entsize);
    const readUInt32 = (bigEndian ? Buffer.prototype.readUInt32BE : Buffer.prototype.readUInt32LE).bind(buff);
    const readUInt64 = (bigEndian ? Buffer.prototype.readBigUInt64BE : Buffer.prototype.readBigUInt64LE).bind(buff);

    const result = new Array(ph_num);

    for (let i = 0; i < ph_num; i++) {
        await fh.read(buff, 0, ph_entsize, (ph_off as number) + i * ph_entsize);
        const type = readUInt32(0);

        let ix = 4;
        let flags, offset, vaddr, paddr, filesz, memsz, align;
        if (bits == 32) {
            offset = readUInt32(ix); ix += 4;
            vaddr = readUInt32(ix); ix += 4;
            paddr = readUInt32(ix); ix += 4;
            filesz = readUInt32(ix); ix += 4;
            memsz = readUInt32(ix); ix += 4;
            flags = readUInt32(ix); ix += 4;
            align = readUInt32(ix); ix += 4;
        } else {
            flags = readUInt32(ix); ix += 4;
            offset = readUInt64(ix); ix += 8;
            vaddr = readUInt64(ix); ix += 8;
            paddr = readUInt64(ix); ix += 8;
            filesz = readUInt64(ix); ix += 8;
            memsz = readUInt64(ix); ix += 8;
            align = readUInt64(ix); ix += 8;
        }

        result[i] = {
            index: i,
            type,
            typeDescription: ProgramHeaderEntryTypeToString(type),
            flags,
            flagsDescription: programHeaderFlagsToString(flags),
            offset,
            vaddr,
            paddr,
            filesz,
            memsz,
            align
        }
    }

    return result;
}