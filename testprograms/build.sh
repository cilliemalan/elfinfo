#!/bin/bash

set -e

make -f Makefile.gcc-x64 &
make -f Makefile.clang-x64 &
make -f Makefile.gcc-arm-eabi &
make -f Makefile.gcc-riscv-eabi &
make -f Makefile.gcc-aarch64 &
make -f Makefile.gcc-aarch64_be &
make -f Makefile.gcc-arm &

wait

