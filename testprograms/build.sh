#!/bin/bash

set -e

make -f Makefile.gcc-pc
make -f Makefile.clang-pc
make -f Makefile.gcc-arm-eabi
make -f Makefile.gcc-riscv-eabi
