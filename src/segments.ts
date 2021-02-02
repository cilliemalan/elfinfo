
import { ELFSegment } from './types';
import { programHeaderEntryTypeToString, programHeaderFlagsToString } from './strings';
import { Reader } from './reader';
import { toNumberSafe } from './biginthelpers';

export async function readProgramHeaderEntries(fh: Reader,
    ph_off: number | BigInt, ph_entsize: number, ph_num: number,
    bits: number, bigEndian: boolean): Promise<ELFSegment[]> {

    if (ph_num == 0) {
        return [];
    }

    const result = new Array<ELFSegment>(ph_num);

    for (let i = 0; i < ph_num; i++) {
        const view = await fh.view(ph_entsize, Number(ph_off) + i * Number(ph_entsize));
        const readUInt32 = (ix: number) => view.getUint32(ix, !bigEndian);
        const readUInt64 = (ix: number) => view.getBigUint64(ix, !bigEndian);
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
            offset = toNumberSafe(readUInt64(ix)); ix += 8;
            vaddr = readUInt64(ix); ix += 8;
            paddr = readUInt64(ix); ix += 8;
            filesz = toNumberSafe(readUInt64(ix)); ix += 8;
            memsz = toNumberSafe(readUInt64(ix)); ix += 8;
            align = toNumberSafe(readUInt64(ix)); ix += 8;
        }

        result[i] = {
            index: i,
            type,
            typeDescription: programHeaderEntryTypeToString(type),
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