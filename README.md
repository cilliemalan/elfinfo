# elfinfo
A javascript library to parse information from ELF files. Doesn't do anything just yet.

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
