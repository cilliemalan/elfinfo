import * as fs from "fs";
import {
    ELFSymbol, ELFSectionHeaderEntry, SectionHeaderEntryType
} from "./types";
import {
    symbolBindingToString, symbolTypeToString, symbolVisibilityToString,
    sectionFlagsToString, shndxToString, sectionHeaderEntryTypeToString
} from "./strings";

const MAX_SECTION_LOAD_SIZE = 0x1000000;

function getString(strings: { [index: number]: string; }, index: number) {

    let str = strings[index];
    if (!str) {
        // both GCC and clang have a tendency to
        // point to the middle of a string if the
        // end part is what's needed
        for (const key in strings) {
            const kv = parseInt(key);
            if (kv < index) {
                const ss = strings[kv];
                if (kv + ss.length > index) {
                    str = ss.substr(index - kv);
                    break;
                }
            }
        }
    }

    return str;
}

async function readStringSection(fh: fs.promises.FileHandle, offset: number, size: number): Promise<{ [index: number]: string }> {
    const tmp = Buffer.alloc(size);
    await fh.read(tmp, 0, size, offset);
    let ix = 0;
    const strings: {
        [index: number]: string;
    } = {};
    for (let i = 0; i < size; i++) {
        if (tmp[i] == 0) {
            const slen = i - ix;
            if (slen > 0) {
                strings[ix] = tmp.toString('utf8', ix, i);
            }
            ix = i + 1;
        }
    }
    return strings;
}

async function readSymbolsSection(fh: fs.promises.FileHandle, offset: number, size: number, entsize: number, bigEndian: boolean, bits: number): Promise<ELFSymbol[]> {

    const tmp = Buffer.alloc(entsize);
    const readUint8 = Buffer.prototype.readUInt8.bind(tmp);
    const readUInt16 = (bigEndian ? Buffer.prototype.readUInt16BE : Buffer.prototype.readUInt16LE).bind(tmp);
    const readUInt32 = (bigEndian ? Buffer.prototype.readUInt32BE : Buffer.prototype.readUInt32LE).bind(tmp);
    const readUInt64 = (bigEndian ? Buffer.prototype.readBigUInt64BE : Buffer.prototype.readBigUInt64LE).bind(tmp);

    const num = size / entsize;
    let ix = 0;
    const symbols: ELFSymbol[] = [];
    for (let i = 0; i < num; i++) {
        await fh.read(tmp, 0, entsize, offset + i * entsize);
        let ix = 0;

        let name, info, other, shndx, value, size;
        if (bits == 32) {
            name = readUInt32(ix); ix += 4;
            value = readUInt32(ix); ix += 4;
            size = readUInt32(ix); ix += 4;
            info = readUint8(ix); ix += 1;
            other = readUint8(ix); ix += 1;
            shndx = readUInt16(ix); ix += 2;
        }
        else {
            name = readUInt32(ix); ix += 4;
            info = readUint8(ix); ix += 1;
            other = readUint8(ix); ix += 1;
            shndx = readUInt16(ix); ix += 2;
            value = Number(readUInt64(ix)); ix += 8;
            size = Number(readUInt64(ix)); ix += 8;
        }
        const type = info & 0xf;
        const binding = info >> 4;
        const visibility = other & 3;

        symbols[i] = {
            nameix: name,
            name: "",
            info,
            other,
            shndx,
            value,
            size,
            type,
            binding,
            visibility,
            typeDescription: symbolTypeToString(type),
            bindingDescription: symbolBindingToString(binding),
            visibilityDescription: symbolVisibilityToString(visibility),
            shndxDescription: shndxToString(shndx)
        };
    }

    return symbols;
}

function fillInSymbolNames(symbols: ELFSymbol[], strings?: { [index: number]: string; }) {
    if (!strings) return;

    for (let i = 0; i < symbols.length; i++) {
        symbols[i].name = strings[symbols[i].nameix] || "";
    }
}

export async function readSectionHeaderEntries(fh: fs.promises.FileHandle,
    sh_off: number | BigInt, sh_entsize: number, sh_num: number,
    bits: number, bigEndian: boolean, eSHStrNdx: number): Promise<ELFSectionHeaderEntry[]> {

    if (sh_num == 0) {
        return [];
    }

    const buff = Buffer.alloc(sh_entsize);
    const readUInt32 = (bigEndian ? Buffer.prototype.readUInt32BE : Buffer.prototype.readUInt32LE).bind(buff);
    const readUInt64 = (bigEndian ? Buffer.prototype.readBigUInt64BE : Buffer.prototype.readBigUInt64LE).bind(buff);

    const result: ELFSectionHeaderEntry[] = new Array(sh_num);

    for (let i = 0; i < sh_num; i++) {
        await fh.read(buff, 0, sh_entsize, (sh_off as number) + i * sh_entsize);

        const name = readUInt32(0);
        const type = readUInt32(4);

        let ix = 8;
        let flags, addr, offset, size, link, info, addralign, entsize;
        if (bits == 32) {
            flags = readUInt32(ix); ix += 4;
            addr = readUInt32(ix); ix += 4;
            offset = readUInt32(ix); ix += 4;
            size = readUInt32(ix); ix += 4;
            link = readUInt32(ix); ix += 4;
            info = readUInt32(ix); ix += 4;
            addralign = readUInt32(ix); ix += 4;
            entsize = readUInt32(ix); ix += 4;
        } else {
            flags = Number(readUInt64(ix)); ix += 8;
            addr = Number(readUInt64(ix)); ix += 8;
            offset = Number(readUInt64(ix)); ix += 8;
            size = Number(readUInt64(ix)); ix += 8;
            link = readUInt32(ix); ix += 4;
            info = readUInt32(ix); ix += 4;
            addralign = Number(readUInt64(ix)); ix += 8;
            entsize = Number(readUInt64(ix)); ix += 8;
        }

        const section: ELFSectionHeaderEntry = {
            index: i,
            name: "",
            nameix: name,
            type,
            typeDescription: sectionHeaderEntryTypeToString(type),
            flags,
            flagsDescription: sectionFlagsToString(flags),
            addr,
            offset,
            size,
            link,
            info,
            addralign,
            entsize
        }

        result[i] = section;
    }

    // find strtab
    for (let i = 0; i < sh_num; i++) {
        const section = result[i];
        const { size, type, offset } = section;

        if (size < MAX_SECTION_LOAD_SIZE && type === SectionHeaderEntryType.StrTab) {
            section.strings = await readStringSection(fh, offset, size);
        }
    }

    // process all symbols
    for (let i = 0; i < sh_num; i++) {
        const section = result[i];
        const { size, type, offset, entsize, link } = section;

        if (size < MAX_SECTION_LOAD_SIZE && type === SectionHeaderEntryType.SymTab) {
            section.symbols = await readSymbolsSection(fh, offset, size, entsize, bigEndian, bits);
            if (link >= 0 && link < result.length) {
                fillInSymbolNames(section.symbols, result[link].strings);
            }
        }
    }

    fillInSectionHeaderNames(result, eSHStrNdx);

    return result;
}

function fillInSectionHeaderNames(sections: ELFSectionHeaderEntry[], eSHStrNdx: number) {
    if (eSHStrNdx < sections.length) {
        const strs = sections[eSHStrNdx] && sections[eSHStrNdx].strings;
        if (strs) {
            sections.forEach(v => {
                if (v.nameix == 0) {
                    v.name = "<null>";
                } else {
                    const name = getString(strs, v.nameix);
                    if (name) {
                        v.name = name;
                    }
                }
            });
        }
    }
}