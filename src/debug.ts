import { isRelocationSection, isStringSection, isSymbolSection } from './sections';
import { SectionHeaderEntryType, ELFOpenResult } from './types';
import { ELF } from './types';

function toHex(n: number | bigint | undefined, padamount: number = 0) {
    if (n !== undefined) {
        const hexchars = n.toString(16);
        if (padamount == 0) {
            padamount = typeof n == 'bigint' ? 8 :
                hexchars.length <= 2 ? 2 :
                    hexchars.length <= 4 ? 4 :
                        8;
        }
        return `0x${hexchars.padStart(padamount, '0')}`;
    } else {
        return '<undefined>';
    }
}

/**
 * Print debug information for an ELF file, similar to readelf or objdump.
 * @param {ELF | ELFOpenResult} file the ELF file data to print debug info for.
 * @returns {string} Debug outpt.
 */
export function debug(elf_: ELF | ELFOpenResult): string {
    let result = "";

    const elf: ELF | undefined = (elf_ as any).elf ? (elf_ as ELFOpenResult).elf : (elf_ as ELF);

    if (elf) {
        const addrpad = elf.bits ? elf.bits / 4 : 8;
        result += `Path: ${elf.path}\n`;
        result += `Class:                             ${elf.classDescription} (${elf.class})\n`;
        result += `Bits:                              ${elf.bits} bits\n`;
        result += `Data:                              ${elf.dataDescription} (${elf.data})\n`;
        result += `Version:                           ${elf.version}\n`;
        result += `OS/ABI:                            ${elf.abiDescription} (${toHex(elf.abi)})\n`;
        result += `ABI version:                       ${elf.abiVersion}\n`;
        result += `Type:                              ${elf.typeDescription} (${toHex(elf.type)})\n`;
        result += `ISA/machine:                       ${elf.isaDescription} (${toHex(elf.isa)})\n`;
        result += `ISA/machine version:               ${elf.isaVersion}\n`;
        result += `Entry Point:                       ${toHex(elf.entryPoint)}\n`;
        result += `Program header offset:             ${toHex(elf.programHeaderOffset)}\n`;
        result += `Section header offset:             ${toHex(elf.sectionHeaderOffset)}\n`;
        result += `Flags:                             ${elf.flagsDescription} (${toHex(elf.flags)})\n`;
        result += `Program headers:                   ${elf.programHeaderEntrySize} bytes × ${elf.segments.length}\n`;
        result += `Section headers:                   ${elf.sectionHeaderEntrySize} bytes × ${elf.sections.length}\n`;
        result += `String table section index:        ${elf.shstrIndex}\n`;

        if (elf.segments.length) {

            result += '\n\nProgram Header Entries:\n\n';
            if (elf.bits == 32) {
                result += '    #   Type                 Offset     VirtAddr   PhysAddr   FileSize   MemSiz     Align      Flags\n';
            } else {
                result += '    #   Type                 Offset             VirtAddr           PhysAddr           FileSize           MemSiz             Align      Flags\n';
            }
            for (const header of elf.segments) {
                result += `    ${header.index.toString().padEnd(3)} `
                result += `${header.typeDescription.padEnd(20)} `;
                result += `${toHex(header.offset, addrpad)} `;
                result += `${toHex(header.vaddr, addrpad)} `;
                result += `${toHex(header.paddr, addrpad)} `;
                result += `${toHex(header.filesz, addrpad)} `;
                result += `${toHex(header.memsz, addrpad)} `;
                result += `${toHex(header.align, 8)} `;
                result += `${header.flagsDescription}\n`;
            }
        }

        if (elf.sections.length) {

            result += '\n\n\Sections:\n\n';
            if (elf.bits == 32) {
                result += '    #   Name               Type                             Address    Offset     Size       EntSize    Link  Info  Align      Flags\n';
            } else {
                result += '    #   Name               Type                             Address            Offset             Size               EntSize            Link  Info  Align      Flags\n';
            }

            for (const section of elf.sections) {
                result += `    ${section.index.toString().padEnd(3)} `
                result += `${section.name.substr(0, 18).padEnd(18)} `;
                result += `${section.typeDescription.padEnd(32)} `;
                result += `${toHex(section.addr, addrpad)} `;
                result += `${toHex(section.offset, addrpad)} `;
                result += `${toHex(section.size, addrpad)} `;
                result += `${toHex(section.entsize, addrpad)} `;
                result += `${(section.link || '').toString().padStart(4)}  `;
                result += `${(section.info || '').toString().padStart(4)}  `;
                result += `${toHex(section.addralign, 8)} `;
                result += `${section.flagsDescription}\n`;
            }
        }

        for (const section of elf.sections) {
            result += `\n\n${section.typeDescription} section #${section.index} ${section.name}:\n\n`;

            if (isSymbolSection(section)) {
                if (elf.bits == 32) {
                    result += '      #   Value      Size       Type                         Bind   Visibility Name\n';
                } else {
                    result += '      #   Value              Info       Type                         Bind   Visibility Name\n';
                }// 0x0000000000000000

                let ix = 0;
                for (const symbol of section.symbols) {
                    result += `    ${(ix++).toString().padStart(5)} `;
                    result += `${toHex(symbol.value, addrpad)} `;
                    result += `${toHex(symbol.size, 8)} `;
                    result += `${symbol.typeDescription.padEnd(28)} `;
                    result += `${symbol.bindingDescription.padEnd(6)} `;
                    result += `${symbol.visibilityDescription.padEnd(10)} `;
                    result += `${symbol.name}\n`;
                }
            }
            else if (isStringSection(section)) {
                for (const string in section.strings) {
                    result += `  #${string} - ${section.strings[string]}\n`;
                }
            }
            else if (isRelocationSection(section)) {
                `  Offset          Info           Type           Sym. Value    Sym. Name + Addend`
                if (elf.bits == 32) {
                    result += '        # Offset     Size       Type                         Bind   Visibility Name\n';
                } else {
                    result += '        # Offset             Size               Type                         Bind   Visibility Name\n';
                }

                let ix = 0;
                for (const relocation of section.relocations) {
                    result += `    ${(ix++).toString().padStart(5)} `;
                    result += `${toHex(relocation.addr, addrpad)} `;
                    result += `${toHex(relocation.info, addrpad)} `;
                    result += '\n';
                }
            }
            else {
            }
        }

    } else {
        result += "<undefined>";
    }


    return result;
}