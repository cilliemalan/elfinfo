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

# Testing
In order to run tests you will need to have the following programs installed and in your path
- [gcc](https://gcc.gnu.org/)
- [clang](https://releases.llvm.org/download.html#10.0.0)
- [arm eabi gcc](https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm/downloads)
- [riscv embedded gcc](https://github.com/xpack-dev-tools/riscv-none-embed-gcc-xpack/releases/)

*Note:* just because the programs compile doesn't mean they will work or represent how one should 
write programs for any of the given platforms. The idea is to generate executables for tests
and the tests don't run the programs, they just expect the ELF files to contain certain things.

# License
See [LICENSE](LICENSE) which applies to all files in this repository unless otherwise specified.
