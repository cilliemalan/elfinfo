import { ELFFile } from './types';

function toHex(n: number | BigInt, padamount: number = 0) {
    const hexchars = n.toString(16);
    if (padamount == 0) {
        padamount = n instanceof BigInt ? 8 :
            hexchars.length <= 2 ? 2 :
                hexchars.length <= 4 ? 4 :
                    8;
    }
    return `0x${hexchars.padStart(padamount, '0')}`;
}

export function debug(file: ELFFile): string {
    let result = "";
    const addrpad = file.bits / 4;

    if (file) {
        result += `Path: ${file.path}\n`;
        result += `Class:                             ${file.classDescription} (${file.class})\n`;
        result += `Bits:                              ${file.bits} bits\n`;
        result += `Data:                              ${file.dataDescription} (${file.data})\n`;
        result += `Version:                           ${file.version}\n`;
        result += `OS/ABI:                            ${file.abiDescription} (${toHex(file.abi)})\n`;
        result += `ABI version:                       ${file.abiVersion}\n`;
        result += `Type:                              ${file.typeDescription} (${toHex(file.type)})\n`;
        result += `ISA/machine:                       ${file.isaDescription} (${toHex(file.isa)})\n`;
        result += `ISA/machine version:               ${file.isaVersion}\n`;
        result += `Entry Point:                       ${toHex(file.entryPoint)}\n`;
        result += `Program header offset:             ${toHex(file.programHeaderOffset)}\n`;
        result += `Section header offset:             ${toHex(file.sectionHeaderOffset)}\n`;
        result += `Flags:                             ${file.flagsDescription} (${toHex(file.flags)})\n`;
        result += `Program headers:                   ${file.programHeaderEntrySize} bytes × ${file.programHeaderEntries.length}\n`;
        result += `Section headers:                   ${file.sectionHeaderEntrySize} bytes × ${file.sectionHeaderEntries.length}\n`;
        result += `String table section index:        ${file.shstrIndex}\n`;

        if (file.programHeaderEntries.length) {

            result += '\n\nProgram Header Entries:\n\n';
            if (file.bits == 32) {
                result += '    #   Type                 Offset     VirtAddr   PhysAddr   FileSize   MemSiz     Align      Flags\n';
            } else {
                result += '    #   Type                 Offset             VirtAddr           PhysAddr           FileSize           MemSiz             Align      Flags\n';
            }
            for (const header of file.programHeaderEntries) {
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

        if (file.sectionHeaderEntries.length) {
            
            result += '\n\n\Sections:\n\n';
            if (file.bits == 32) {
                result += '#   Name               Type                             Address    Offset     Size       EntSize    Link  Info  Align      Flags\n';
            } else {
                result += '#   Name               Type                             Address            Offset             Size               EntSize            Link  Info  Align      Flags\n';
            }
            
            for(const section of file.sectionHeaderEntries) {
                result += `${section.index.toString().padEnd(3)} `
                result += `${section.name.substr(0, 18).padEnd(18)} `;
                result += `${section.typeDescription.padEnd(32)} `;
                result += `${toHex(section.addr, addrpad) } `;
                result += `${toHex(section.offset, addrpad) } `;
                result += `${toHex(section.size, addrpad) } `;
                result += `${toHex(section.entsize, addrpad) } `;
                result += `${(section.link || '').toString().padStart(4)}  `;
                result += `${(section.info || '').toString().padStart(4)}  `;
                result += `${toHex(section.addralign, 8) } `;
                result += `${section.flagsDescription }\n`;
            }
        }
    } else {
        result += "<null>";
    }


    return result;
}