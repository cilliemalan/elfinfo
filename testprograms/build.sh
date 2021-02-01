#!/bin/bash

set -e

check_compiler() {
    printf "checking compiler $1..."
    which $1 > /dev/null
    if [ $? -eq 0 ]
    then
        printf "\r\e[0;32mchecking compiler $1 👍   \e[0m\n"
    else
        printf "\r\e[0;31mchecking compiler $1 👎   \e[0m\n"
    fi
}

check_compiler gcc
check_compiler clang
check_compiler arm-none-eabi-gcc
check_compiler riscv-none-embed-gcc
check_compiler aarch64-none-linux-gnu-gcc
check_compiler aarch64_be-none-linux-gnu-gcc
check_compiler arm-none-linux-gnueabihf-gcc

make -f Makefile.gcc-x64 &
make -f Makefile.clang-x64 &
make -f Makefile.gcc-arm-eabi &
make -f Makefile.gcc-riscv-eabi &
make -f Makefile.gcc-aarch64 &
make -f Makefile.gcc-aarch64_be &
make -f Makefile.gcc-arm &

wait

