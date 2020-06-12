# elfinfo
A javascript library to parse information from ELF files. Has basic functionality at the 
moment but will hopefully have stack analysis and disassembly in the near future.


## Usage

```js
import {open} from 'elfinfo';

// Parse the specified ELF file. the argument
// can also be a buffer or file handle.
const elfdata = await open('someelffile');
```

The `open` function above will parse the ELF file header, program headers, and sections. It will also
read the symbol table and strings. 

`open` can be called with a variety of arguments. A string will open a file, a buffer, array, or blob
will parse directly from memory, and a file handle will read from the file.

### Examining the data
Several functions are provided on the elf data structure for examining information
about symbols and translating addresses. For example, `getSymbolsInSection` will get all the symbols
exist in a specified setcion, `getSymbolFileOffset` will tell you the actual file offset of a symbol
(if possible) so you can actually read the symbol data. There are also functions for doing VMA and LMA
stuff. Documentation is currently pending but autocomplete should work in an IDE like VS Code.

### BigInt and Number
Javascript numbers are doubles. This is non-ideal for 64-bit file offsets so for 64-bit ELF files
BigInt is used whenever the data is stored as a 64 bit number in the ELF file or where something
refers to a memory location. This can be a pain since you can't mix arithmetic for BigInt and Number.
There isn't currently a nice solution (I mean, what can you do?), so just be aware of it.

### Terminology
ELF and ELF tools (such as readelf) sometimes use conflicting terminology. Here is an indication of what
things mean according to this library:
- a **Segment** refers to a piece of data that exists in the ELF file and is to be loaded into memory at
  a certain location. In the ELF file they are stored as *Program Header Entries*. A segment consists mainly of
  a file offset and two memory locations, the virtual and physical memory locations.
- a **Section** refers to the various sections stored in the ELF file. A section has an address which
  is always a virtual (VMA) address. Each section mainly consists of a name, a type, a virtual memory location, and a size.
  There are many kinds of sections, but the main ones are those that contain program data (either code or data), symbols,
  and strings. elfinfo currently parses string and symbol sections.
- a **Symbol** can refer to many different things, but usually refers to a *function* or *variable* used in code.
  There are also symbols for sections and files, but these are more for debugging and operating system purposes
  so locations in memory can be related to other things, and don't relate to the execution of the code itself. Symbols
  are stored in symbol table sections, and the names of symbols are stored in string table sections. Stored with the symbol is the
  name of the symbol, the type of the symbol, the virtual memory location of the symbol, sometimes the size of the symbol,
  and some other things.
- a **Virtual Address** refers to the address a segment, section, or symbol has in memory. This is sometimes referred
  to as a *VMA address* or a *memory address*.
- a **Physical Address** refers to the address a segment, section, or symbol has on disk. This does not refer to the
  offset in the file. A normal ELF executable for an operating system like linux will usually have virtual addresses
  match the physical addresses since the file can be mapped into memory wherever needed. However, in embedded systems
  the data for virtual memory locations needs to be stored on disk somewhere. This is the physical address. This is
  also called the *LMA address* or *load address*.  Some symbols and sections don't have a physical address (for example,
  BSS section symbols that are cleared in memory on startup).
- a **File Offset** refers to a location in the ELF file itself. Only segments have file offsets, but the file offset
  can be calculated for a section or symbol, if it exists.

### What gets parsed
A debug function is also provided, that spits out readelf/objdump like stuff.

```js
import {open,debug} from 'elfinfo';

// read the ELF file
const elfdata = await open('someelffile');

// generate human-readable output
const fileinfo = debug(elfdata);
console.log(fileinfo.elf);
```

This will produce the following output. This may help you get an idea of what elfinfo parses at the moment:

```
Path: someelffile
Class:                             ELF64 (2)
Bits:                              64 bits
Data:                              Little endian (1)
Version:                           1
OS/ABI:                            SystemV (0x00)
ABI version:                       0
Type:                              Executable (0x02)
ISA/machine:                       x64 (0x3e)
ISA/machine version:               1
Entry Point:                       0x004003e0
Program header offset:             0x40
Section header offset:             0x18b0
Flags:                             0 (0x00)
Program headers:                   56 bytes × 9
Section headers:                   64 bytes × 27
String table section index:        26


Program Header Entries:

    #   Type                 Offset             VirtAddr           PhysAddr           FileSize           MemSiz             Align      Flags
    0   Program Header Table 0x0000000000000040 0x0000000000400040 0x0000000000400040 0x00000000000001f8 0x00000000000001f8 0x00000008 Read
    1   Interp               0x0000000000000238 0x0000000000400238 0x0000000000400238 0x000000000000001c 0x000000000000001c 0x00000001 Read
    2   Load                 0x0000000000000000 0x0000000000400000 0x0000000000400000 0x0000000000000840 0x0000000000000840 0x00200000 Read | Execute
    3   Load                 0x0000000000000e10 0x0000000000600e10 0x0000000000600e10 0x0000000000000210 0x0000000000000218 0x00200000 Read | Write
    4   Dynamic              0x0000000000000e20 0x0000000000600e20 0x0000000000600e20 0x00000000000001d0 0x00000000000001d0 0x00000008 Read | Write
    5   Note                 0x0000000000000254 0x0000000000400254 0x0000000000400254 0x0000000000000020 0x0000000000000020 0x00000004 Read
    6   GNU EH frame         0x00000000000006bc 0x00000000004006bc 0x00000000004006bc 0x000000000000004c 0x000000000000004c 0x00000004 Read
    7   GNU stack info       0x0000000000000000 0x0000000000000000 0x0000000000000000 0x0000000000000000 0x0000000000000000 0x00000010 Read | Write
    8   GNU ro relocation    0x0000000000000e10 0x0000000000600e10 0x0000000000600e10 0x00000000000001f0 0x00000000000001f0 0x00000001 Read


Sections:

    #   Name               Type                             Address            Offset             Size               EntSize            Link  Info  Align      Flags
    0   <null>             NULL section                     0x0000000000000000 0x0000000000000000 0x0000000000000000 0x0000000000000000             0x00000000 <none>
    1   .interp            Prog bits                        0x0000000000400238 0x0000000000000238 0x000000000000001c 0x0000000000000000             0x00000001 Alloc
    2   .note.ABI-tag      Note                             0x0000000000400254 0x0000000000000254 0x0000000000000020 0x0000000000000000             0x00000004 Alloc
    3   .gnu.hash          GNU hash section                 0x0000000000400278 0x0000000000000278 0x000000000000001c 0x0000000000000000    4        0x00000008 Alloc
    4   .dynsym            Dynamic linking symbols section  0x0000000000400298 0x0000000000000298 0x0000000000000060 0x0000000000000018    5     1  0x00000008 Alloc
    5   .dynstr            String table                     0x00000000004002f8 0x00000000000002f8 0x000000000000003f 0x0000000000000000             0x00000001 Alloc
    6   .gnu.version       GNU version symbol table         0x0000000000400338 0x0000000000000338 0x0000000000000008 0x0000000000000002    4        0x00000002 Alloc
    7   .gnu.version_r     GNU version needs section        0x0000000000400340 0x0000000000000340 0x0000000000000020 0x0000000000000000    5     1  0x00000008 Alloc
    8   .rela.dyn          Relocation section with addends  0x0000000000400360 0x0000000000000360 0x0000000000000030 0x0000000000000018    4        0x00000008 Alloc
    9   .rela.plt          Relocation section with addends  0x0000000000400390 0x0000000000000390 0x0000000000000018 0x0000000000000018    4    21  0x00000008 Alloc | Info Link
    10  .init              Prog bits                        0x00000000004003a8 0x00000000000003a8 0x0000000000000017 0x0000000000000000             0x00000004 Alloc | Executable
    11  .plt               Prog bits                        0x00000000004003c0 0x00000000000003c0 0x0000000000000020 0x0000000000000010             0x00000010 Alloc | Executable
    12  .text              Prog bits                        0x00000000004003e0 0x00000000000003e0 0x0000000000000292 0x0000000000000000             0x00000010 Alloc | Executable
    13  .fini              Prog bits                        0x0000000000400674 0x0000000000000674 0x0000000000000009 0x0000000000000000             0x00000004 Alloc | Executable
    14  .rodata            Prog bits                        0x0000000000400680 0x0000000000000680 0x000000000000003a 0x0000000000000000             0x00000004 Alloc
    15  .eh_frame_hdr      Prog bits                        0x00000000004006bc 0x00000000000006bc 0x000000000000004c 0x0000000000000000             0x00000004 Alloc
    16  .eh_frame          Prog bits                        0x0000000000400708 0x0000000000000708 0x0000000000000138 0x0000000000000000             0x00000008 Alloc
    17  .init_array        Init array                       0x0000000000600e10 0x0000000000000e10 0x0000000000000008 0x0000000000000008             0x00000008 Writeable | Alloc
    18  .fini_array        Fini array                       0x0000000000600e18 0x0000000000000e18 0x0000000000000008 0x0000000000000008             0x00000008 Writeable | Alloc
    19  .dynamic           Dynamic                          0x0000000000600e20 0x0000000000000e20 0x00000000000001d0 0x0000000000000010    5        0x00000008 Writeable | Alloc
    20  .got               Prog bits                        0x0000000000600ff0 0x0000000000000ff0 0x0000000000000010 0x0000000000000008             0x00000008 Writeable | Alloc
    21  .got.plt           Prog bits                        0x0000000000601000 0x0000000000001000 0x0000000000000020 0x0000000000000008             0x00000008 Writeable | Alloc
    22  .bss               No bits                          0x0000000000601020 0x0000000000001020 0x0000000000000008 0x0000000000000000             0x00000001 Writeable | Alloc
    23  .comment           Prog bits                        0x0000000000000000 0x0000000000001020 0x000000000000005f 0x0000000000000001             0x00000001 Merge | Strings
    24  .symtab            Symbol table                     0x0000000000000000 0x0000000000001080 0x0000000000000570 0x0000000000000018   25    42  0x00000008 <none>
    25  .strtab            String table                     0x0000000000000000 0x00000000000015f0 0x00000000000001d1 0x0000000000000000             0x00000001 <none>
    26  .shstrtab          String table                     0x0000000000000000 0x00000000000017c1 0x00000000000000ea 0x0000000000000000             0x00000001 <none>


Symbols for section #4 .dynsym:

    #   Value              Size       Type                         Bind   Visibility Name
        0 0x0000000000000000 0x00000000 None                         Local  Default
        1 0x0000000000000000 0x00000000 Function                     Global Default    printf
        2 0x0000000000000000 0x00000000 Function                     Global Default    __libc_start_main
        3 0x0000000000000000 0x00000000 None                         Weak   Default    __gmon_start__


Symbols for section #24 .symtab:

    #   Value              Size       Type                         Bind   Visibility Name
        0 0x0000000000000000 0x00000000 None                         Local  Default
        1 0x0000000000400238 0x00000000 Section                      Local  Default
        2 0x0000000000400254 0x00000000 Section                      Local  Default
        3 0x0000000000400278 0x00000000 Section                      Local  Default
        4 0x0000000000400298 0x00000000 Section                      Local  Default
        5 0x00000000004002f8 0x00000000 Section                      Local  Default
        6 0x0000000000400338 0x00000000 Section                      Local  Default
        7 0x0000000000400340 0x00000000 Section                      Local  Default
        8 0x0000000000400360 0x00000000 Section                      Local  Default
        9 0x0000000000400390 0x00000000 Section                      Local  Default
        10 0x00000000004003a8 0x00000000 Section                      Local  Default
        11 0x00000000004003c0 0x00000000 Section                      Local  Default
        12 0x00000000004003e0 0x00000000 Section                      Local  Default
        13 0x0000000000400674 0x00000000 Section                      Local  Default
        14 0x0000000000400680 0x00000000 Section                      Local  Default
        15 0x00000000004006bc 0x00000000 Section                      Local  Default
        16 0x0000000000400708 0x00000000 Section                      Local  Default
        17 0x0000000000600e10 0x00000000 Section                      Local  Default
        18 0x0000000000600e18 0x00000000 Section                      Local  Default
        19 0x0000000000600e20 0x00000000 Section                      Local  Default
        20 0x0000000000600ff0 0x00000000 Section                      Local  Default
        21 0x0000000000601000 0x00000000 Section                      Local  Default
        22 0x0000000000601020 0x00000000 Section                      Local  Default
        23 0x0000000000000000 0x00000000 Section                      Local  Default
        24 0x0000000000000000 0x00000000 File                         Local  Default    crtstuff.c
        25 0x0000000000400420 0x00000000 Function                     Local  Default    deregister_tm_clones
        26 0x0000000000400450 0x00000000 Function                     Local  Default    register_tm_clones
        27 0x0000000000400490 0x00000000 Function                     Local  Default    __do_global_dtors_aux
        28 0x0000000000601020 0x00000001 Object                       Local  Default    completed.7698
        29 0x0000000000600e18 0x00000000 Object                       Local  Default    __do_global_dtors_aux_fini_array_entry
        30 0x00000000004004c0 0x00000000 Function                     Local  Default    frame_dummy
        31 0x0000000000600e10 0x00000000 Object                       Local  Default    __frame_dummy_init_array_entry
        32 0x0000000000000000 0x00000000 File                         Local  Default    factorial.cpp
        33 0x0000000000000000 0x00000000 File                         Local  Default    main.cpp
        34 0x0000000000000000 0x00000000 File                         Local  Default    crtstuff.c
        35 0x000000000040083c 0x00000000 Object                       Local  Default    __FRAME_END__
        36 0x0000000000000000 0x00000000 File                         Local  Default
        37 0x0000000000600e18 0x00000000 None                         Local  Default    __init_array_end
        38 0x0000000000600e20 0x00000000 Object                       Local  Default    _DYNAMIC
        39 0x0000000000600e10 0x00000000 None                         Local  Default    __init_array_start
        40 0x00000000004006bc 0x00000000 None                         Local  Default    __GNU_EH_FRAME_HDR
        41 0x0000000000601000 0x00000000 Object                       Local  Default    _GLOBAL_OFFSET_TABLE_
        42 0x0000000000400670 0x00000002 Function                     Global Default    __libc_csu_fini
        43 0x0000000000601020 0x00000000 None                         Global Default    _edata
        44 0x0000000000400674 0x00000000 Function                     Global Default    _fini
        45 0x0000000000000000 0x00000000 Function                     Global Default    printf@@GLIBC_2.2.5
        46 0x0000000000000000 0x00000000 Function                     Global Default    __libc_start_main@@GLIBC_2.2.5
        47 0x0000000000400510 0x00000072 Function                     Global Default    _Z10factorialff
        48 0x00000000004004d0 0x0000003e Function                     Global Default    _Z10factorialii
        49 0x0000000000000000 0x00000000 None                         Weak   Default    __gmon_start__
        50 0x0000000000400600 0x00000065 Function                     Global Default    __libc_csu_init
        51 0x0000000000601028 0x00000000 None                         Global Default    _end
        52 0x0000000000400410 0x00000002 Function                     Global Hidden     _dl_relocate_static_pie
        53 0x00000000004003e0 0x0000002b Function                     Global Default    _start
        54 0x0000000000601020 0x00000000 None                         Global Default    __bss_start
        55 0x0000000000400590 0x0000006f Function                     Global Default    main
        56 0x0000000000601020 0x00000000 Object                       Global Hidden     __TMC_END__
        57 0x00000000004003a8 0x00000000 Function                     Global Default    _init
```

* * *

# Documentation

<a name="open"></a>

## open(pathOrDataOrFile, [callback]) ⇒ <code>Promise.&lt;ELFOpenResult&gt;</code>
Parse an ELF file. Parsing will be async if a path, blob, or promise-based file handle is specified and synchronous if the contents is specified.

**Kind**: global function  
**Returns**: <code>Promise.&lt;ELFOpenResult&gt;</code> - a result indicating the success or failure of parsing and the data for the ELF file.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| pathOrDataOrFile | <code>any</code> |  | the path to the ELF file, or the data for the file. |
| [callback] | <code>function</code> | <code></code> | When specified, this will be called after the file is done parsing. |

<a name="debug"></a>

## debug(file) ⇒ <code>string</code>
Print debug information for an ELF file, similar to readelf or objdump.

**Kind**: global function  
**Returns**: <code>string</code> - Debug outpt.  

| Param | Type | Description |
| --- | --- | --- |
| file | [<code>ELF</code>](#ELF) | the ELF file data to print debug info for. |

<a name="ELF"></a>

## ELF
Information parsed from an ELF file.

**Kind**: global class  

* [ELF](#ELF)
    * [.getSymbols()](#ELF+getSymbols) ⇒ <code>Array.&lt;ELFSymbol&gt;</code>
    * [.getSymbolsInSection(sectionOrIndex)](#ELF+getSymbolsInSection) ⇒ <code>Array.&lt;ELFSymbol&gt;</code>
    * [.getSymbolsInSegment(segmentOrIndex)](#ELF+getSymbolsInSegment) ⇒ <code>Array.&lt;ELFSymbol&gt;</code>
    * [.getSectionsInSegment(segmentOrIndex)](#ELF+getSectionsInSegment) ⇒ <code>Array.&lt;ELFSectionHeaderEntry&gt;</code>
    * [.getSectionsForSymbol(symbol)](#ELF+getSectionsForSymbol) ⇒ <code>Array.&lt;ELFSectionHeaderEntry&gt;</code>
    * [.getSectionForSymbol(symbol)](#ELF+getSectionForSymbol) ⇒ <code>ELFSectionHeaderEntry</code>
    * [.getSegmentsForSymbol(symbol)](#ELF+getSegmentsForSymbol) ⇒ <code>ELFSectionHeaderEntry</code>
    * [.getSegmentForSymbol(symbol)](#ELF+getSegmentForSymbol) ⇒ <code>ELFSectionHeaderEntry</code>
    * [.getSymbolsAtVirtualMemoryLocation(location)](#ELF+getSymbolsAtVirtualMemoryLocation) ⇒ <code>Array.&lt;ELFSymbol&gt;</code>
    * [.getSymbolsAtPhysicalMemoryLocation(location)](#ELF+getSymbolsAtPhysicalMemoryLocation) ⇒ <code>Array.&lt;ELFSymbol&gt;</code>
    * [.getSectionsAtVirtualMemoryLocation(location)](#ELF+getSectionsAtVirtualMemoryLocation) ⇒ <code>Array.&lt;ELFSectionHeaderEntry&gt;</code>
    * [.getSectionsAtPhysicalMemoryLocation(location)](#ELF+getSectionsAtPhysicalMemoryLocation) ⇒ <code>Array.&lt;ELFSectionHeaderEntry&gt;</code>
    * [.getSegmentsAtVirtualMemoryLocation(location)](#ELF+getSegmentsAtVirtualMemoryLocation) ⇒ <code>ELFSectionHeaderEntry</code>
    * [.getSegmentsAtPhysicalMemoryLocation(location)](#ELF+getSegmentsAtPhysicalMemoryLocation) ⇒ <code>ELFSectionHeaderEntry</code>
    * [.virtualAddressToPhysical(location)](#ELF+virtualAddressToPhysical) ⇒ <code>number</code> \| <code>BigInt</code>
    * [.virtualAddressToFileOffset(location)](#ELF+virtualAddressToFileOffset) ⇒ <code>number</code> \| <code>BigInt</code>
    * [.physicalAddressToVirtual(location)](#ELF+physicalAddressToVirtual) ⇒ <code>number</code> \| <code>BigInt</code>
    * [.physicalAddressToFileOffset(location)](#ELF+physicalAddressToFileOffset) ⇒ <code>number</code> \| <code>BigInt</code>
    * [.fileOffsetToPhysicalAddress(location)](#ELF+fileOffsetToPhysicalAddress) ⇒ <code>number</code> \| <code>BigInt</code>
    * [.fileOffsetToVirtualAddress(location)](#ELF+fileOffsetToVirtualAddress) ⇒ <code>number</code> \| <code>BigInt</code>
    * [.getSectionByName(sectionName)](#ELF+getSectionByName) ⇒ <code>ELFSectionHeaderEntry</code>
    * [.getSectionsByName(sectionName)](#ELF+getSectionsByName) ⇒ <code>Array.&lt;ELFSectionHeaderEntry&gt;</code>
    * [.getSymbolByName(symbolName)](#ELF+getSymbolByName) ⇒ <code>Array.&lt;ELFSymbol&gt;</code>
    * [.getSymbolsByName(symbolName)](#ELF+getSymbolsByName) ⇒ <code>Array.&lt;ELFSymbol&gt;</code>
    * [.getSymbolVirtualAddress(symbol)](#ELF+getSymbolVirtualAddress) ⇒ <code>number</code> \| <code>BigInt</code>
    * [.getSymbolPhysicalAddress(symbol)](#ELF+getSymbolPhysicalAddress) ⇒ <code>number</code> \| <code>BigInt</code>
    * [.getSymbolFileOffset(symbol)](#ELF+getSymbolFileOffset) ⇒ <code>number</code> \| <code>BigInt</code>

<a name="ELF+getSymbols"></a>

### elF.getSymbols() ⇒ <code>Array.&lt;ELFSymbol&gt;</code>
Get a consolidates array of all the symbols in the file.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>Array.&lt;ELFSymbol&gt;</code> - an array of symbols.  
<a name="ELF+getSymbolsInSection"></a>

### elF.getSymbolsInSection(sectionOrIndex) ⇒ <code>Array.&lt;ELFSymbol&gt;</code>
Get all the symbols that are addressed inside a given section.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>Array.&lt;ELFSymbol&gt;</code> - an array of symbols that are addressed in the section.  

| Param | Type | Description |
| --- | --- | --- |
| sectionOrIndex | <code>ELFSectionHeaderEntry</code> \| <code>number</code> | either the section or the index of the section. |

<a name="ELF+getSymbolsInSegment"></a>

### elF.getSymbolsInSegment(segmentOrIndex) ⇒ <code>Array.&lt;ELFSymbol&gt;</code>
Get all the symbols that are addressed inside a given segment.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>Array.&lt;ELFSymbol&gt;</code> - an array of symbols that are addressed in the segment.  

| Param | Type | Description |
| --- | --- | --- |
| segmentOrIndex | <code>ELFProgramHeaderEntry</code> \| <code>number</code> | either the segment or the index of the segment. |

<a name="ELF+getSectionsInSegment"></a>

### elF.getSectionsInSegment(segmentOrIndex) ⇒ <code>Array.&lt;ELFSectionHeaderEntry&gt;</code>
Get all the section that are addressed inside a given segment.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>Array.&lt;ELFSectionHeaderEntry&gt;</code> - an array of sections that are addressed in the segment.  

| Param | Type | Description |
| --- | --- | --- |
| segmentOrIndex | <code>ELFProgramHeaderEntry</code> \| <code>number</code> | either the segment or the index of the segment. |

<a name="ELF+getSectionsForSymbol"></a>

### elF.getSectionsForSymbol(symbol) ⇒ <code>Array.&lt;ELFSectionHeaderEntry&gt;</code>
Get the first section in which a symbol is addressed.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>Array.&lt;ELFSectionHeaderEntry&gt;</code> - an array of sections that contain the symbol.  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>Symbol</code> | The symbol |

<a name="ELF+getSectionForSymbol"></a>

### elF.getSectionForSymbol(symbol) ⇒ <code>ELFSectionHeaderEntry</code>
Get all sections in which a symbol is addressed.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>ELFSectionHeaderEntry</code> - the first section which contains the symbol.  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>Symbol</code> | The symbol |

<a name="ELF+getSegmentsForSymbol"></a>

### elF.getSegmentsForSymbol(symbol) ⇒ <code>ELFSectionHeaderEntry</code>
Get the first segment in which a symbol is addressed.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>ELFSectionHeaderEntry</code> - all segments which contain the symbol.  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>Symbol</code> | The symbol |

<a name="ELF+getSegmentForSymbol"></a>

### elF.getSegmentForSymbol(symbol) ⇒ <code>ELFSectionHeaderEntry</code>
Get the first segment in which a symbol is addressed.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>ELFSectionHeaderEntry</code> - the first segment which contains the symbol.  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>Symbol</code> | The symbol |

<a name="ELF+getSymbolsAtVirtualMemoryLocation"></a>

### elF.getSymbolsAtVirtualMemoryLocation(location) ⇒ <code>Array.&lt;ELFSymbol&gt;</code>
Find all symbols inside that overlap a given virtual memory location.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>Array.&lt;ELFSymbol&gt;</code> - an array of symbols that contain the location.  

| Param | Type | Description |
| --- | --- | --- |
| location | <code>number</code> \| <code>BigInt</code> | The virtual memory address. |

<a name="ELF+getSymbolsAtPhysicalMemoryLocation"></a>

### elF.getSymbolsAtPhysicalMemoryLocation(location) ⇒ <code>Array.&lt;ELFSymbol&gt;</code>
Find all symbols inside that overlap a given physical memory location.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>Array.&lt;ELFSymbol&gt;</code> - an array of symbols that contain the location.  

| Param | Type | Description |
| --- | --- | --- |
| location | <code>number</code> \| <code>BigInt</code> | The physical memory address. |

<a name="ELF+getSectionsAtVirtualMemoryLocation"></a>

### elF.getSectionsAtVirtualMemoryLocation(location) ⇒ <code>Array.&lt;ELFSectionHeaderEntry&gt;</code>
Get all the sections that overlap a given virtual memory location

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>Array.&lt;ELFSectionHeaderEntry&gt;</code> - an array of sections that find the location inside of them.  

| Param | Type | Description |
| --- | --- | --- |
| location | <code>number</code> \| <code>BigInt</code> | The virtual memory address. |

<a name="ELF+getSectionsAtPhysicalMemoryLocation"></a>

### elF.getSectionsAtPhysicalMemoryLocation(location) ⇒ <code>Array.&lt;ELFSectionHeaderEntry&gt;</code>
Get all the sections that overlap a given physical memory location

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>Array.&lt;ELFSectionHeaderEntry&gt;</code> - an array of sections that find the location inside of them.  

| Param | Type | Description |
| --- | --- | --- |
| location | <code>number</code> \| <code>BigInt</code> | The physical memory address. |

<a name="ELF+getSegmentsAtVirtualMemoryLocation"></a>

### elF.getSegmentsAtVirtualMemoryLocation(location) ⇒ <code>ELFSectionHeaderEntry</code>
Get all the segments that overlap a given virtual memory location

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>ELFSectionHeaderEntry</code> - all segments which contain the address.  

| Param | Type | Description |
| --- | --- | --- |
| location | <code>number</code> \| <code>BigInt</code> | The virtual memory address. |

<a name="ELF+getSegmentsAtPhysicalMemoryLocation"></a>

### elF.getSegmentsAtPhysicalMemoryLocation(location) ⇒ <code>ELFSectionHeaderEntry</code>
Get all the segments that overlap a given physical memory location

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>ELFSectionHeaderEntry</code> - all segments which contain the address.  

| Param | Type | Description |
| --- | --- | --- |
| location | <code>number</code> \| <code>BigInt</code> | The physical memory address. |

<a name="ELF+virtualAddressToPhysical"></a>

### elF.virtualAddressToPhysical(location) ⇒ <code>number</code> \| <code>BigInt</code>
translate a virtual address to a physical address, if possible.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>number</code> \| <code>BigInt</code> - the physical address.  

| Param | Type | Description |
| --- | --- | --- |
| location | <code>number</code> \| <code>BigInt</code> | The virtual memory address. |

<a name="ELF+virtualAddressToFileOffset"></a>

### elF.virtualAddressToFileOffset(location) ⇒ <code>number</code> \| <code>BigInt</code>
translate a virtual address to an offset in the ELF file, if possible.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>number</code> \| <code>BigInt</code> - the file offset.  

| Param | Type | Description |
| --- | --- | --- |
| location | <code>number</code> \| <code>BigInt</code> | The virtual memory address. |

<a name="ELF+physicalAddressToVirtual"></a>

### elF.physicalAddressToVirtual(location) ⇒ <code>number</code> \| <code>BigInt</code>
translate a physical address to a virtual address.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>number</code> \| <code>BigInt</code> - the virtual address.  

| Param | Type | Description |
| --- | --- | --- |
| location | <code>number</code> \| <code>BigInt</code> | The physical memory address. |

<a name="ELF+physicalAddressToFileOffset"></a>

### elF.physicalAddressToFileOffset(location) ⇒ <code>number</code> \| <code>BigInt</code>
translate a physical address to an offset in the ELF file.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>number</code> \| <code>BigInt</code> - the file offset.  

| Param | Type | Description |
| --- | --- | --- |
| location | <code>number</code> \| <code>BigInt</code> | The physical memory address. |

<a name="ELF+fileOffsetToPhysicalAddress"></a>

### elF.fileOffsetToPhysicalAddress(location) ⇒ <code>number</code> \| <code>BigInt</code>
translate a file offset to a physical address, if possible.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>number</code> \| <code>BigInt</code> - the physical address.  

| Param | Type | Description |
| --- | --- | --- |
| location | <code>number</code> \| <code>BigInt</code> | The file offset. |

<a name="ELF+fileOffsetToVirtualAddress"></a>

### elF.fileOffsetToVirtualAddress(location) ⇒ <code>number</code> \| <code>BigInt</code>
translate a file offset to a virtual address, if possible.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>number</code> \| <code>BigInt</code> - the virtual address.  

| Param | Type | Description |
| --- | --- | --- |
| location | <code>number</code> \| <code>BigInt</code> | The file offset. |

<a name="ELF+getSectionByName"></a>

### elF.getSectionByName(sectionName) ⇒ <code>ELFSectionHeaderEntry</code>
Get the first section that matches the name (case-insensitive).

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>ELFSectionHeaderEntry</code> - The first section that matches the name  

| Param | Type | Description |
| --- | --- | --- |
| sectionName | <code>string</code> | the name of the section to find. |

<a name="ELF+getSectionsByName"></a>

### elF.getSectionsByName(sectionName) ⇒ <code>Array.&lt;ELFSectionHeaderEntry&gt;</code>
Get all sections that matches the name (case-insensitive).

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>Array.&lt;ELFSectionHeaderEntry&gt;</code> - an array of sections that match the name.  

| Param | Type | Description |
| --- | --- | --- |
| sectionName | <code>string</code> | the name of the sections to find. |

<a name="ELF+getSymbolByName"></a>

### elF.getSymbolByName(symbolName) ⇒ <code>Array.&lt;ELFSymbol&gt;</code>
Get the first symbol that matches the name (case-insensitive).

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>Array.&lt;ELFSymbol&gt;</code> - an array of symbols that match the name.  

| Param | Type | Description |
| --- | --- | --- |
| symbolName | <code>string</code> | the name of the symbol to find. |

<a name="ELF+getSymbolsByName"></a>

### elF.getSymbolsByName(symbolName) ⇒ <code>Array.&lt;ELFSymbol&gt;</code>
Get all symbols that matches the name (case-insensitive).

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>Array.&lt;ELFSymbol&gt;</code> - an array of symbols that match the name.  

| Param | Type | Description |
| --- | --- | --- |
| symbolName | <code>string</code> | the name of the symbols to find. |

<a name="ELF+getSymbolVirtualAddress"></a>

### elF.getSymbolVirtualAddress(symbol) ⇒ <code>number</code> \| <code>BigInt</code>
Get the virtual address for a symbol. This is just symbol.value.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>number</code> \| <code>BigInt</code> - The virtual address for the symbol.  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>Symbol</code> | The symbol. |

<a name="ELF+getSymbolPhysicalAddress"></a>

### elF.getSymbolPhysicalAddress(symbol) ⇒ <code>number</code> \| <code>BigInt</code>
Get the physical address for a symbol, if possible.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>number</code> \| <code>BigInt</code> - The physical address for the symbol.  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>Symbol</code> | The symbol. |

<a name="ELF+getSymbolFileOffset"></a>

### elF.getSymbolFileOffset(symbol) ⇒ <code>number</code> \| <code>BigInt</code>
Get the offset of a symbol in the ELF file, if possible.

**Kind**: instance method of [<code>ELF</code>](#ELF)  
**Returns**: <code>number</code> \| <code>BigInt</code> - The file offset for the symbol.  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>Symbol</code> | The symbol. |


* * *

# Testing
In order to run tests you will need to have the following programs installed and in your path
- [gcc](https://gcc.gnu.org/)
- [clang](https://releases.llvm.org/download.html#10.0.0)
- [arm eabi gcc](https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm/downloads)
- [riscv embedded gcc](https://github.com/xpack-dev-tools/riscv-none-embed-gcc-xpack/releases/)

*Note:* just because the programs compile doesn't mean they will work or represent how one should 
write programs for any of the given platforms. The idea is to generate executables for tests
and the tests don't run the programs, they just expect the ELF files to contain certain things.

# Roadmap

**Done:**
- [x] Read elf file, including segments and sections.
- [x] Read symbol and string tables and relate them to sections.
- [x] Provide functions for dealing with addresses (VMA, LMA, and file).
- [x] Documentation.

**TODO:**
- [ ] Disassembly of functions.
- [ ] Rudimentary binary analysis, especially stack analysis.
- [ ] Demanging of C++ names (or other names for that matter).
- [ ] Performance. Though the ELF parsing happens in an instant, the functions
      for inspecting the structure are slow and will suffer on big files.
- [ ] Test on more platforms. Currently we do cursory checks for x64, Risc-V and ARM Cortex-M.
      Other platforms of interest could be MIPS and more ARM. executables for these systems should
      load but no tests have been done.
- [ ] A companion library for visualization. I would like to see where everything is and easily be
      able to spot functions that are too big or in the wrong place.

# License
See [LICENSE](LICENSE) which applies to all files in this repository unless otherwise specified.
