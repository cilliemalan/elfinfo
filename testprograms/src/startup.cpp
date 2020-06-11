#if defined(EABI)

#include <stdint.h>

extern "C"
{
    extern uint32_t _sbss;
    extern uint32_t _ebss;
    extern uint32_t _sdata;
    extern uint32_t _sidata;
    extern uint32_t _edata;
    extern uint32_t _sdata2;
    extern uint32_t _sidata2;
    extern uint32_t _edata2;
    extern uint32_t _estack;
    int __libc_init_array();
    int main();

    void Reset_Handler()
    {
#if defined(ARM_EABI)
        // set stack pointer
        asm volatile("ldr sp,=_estack");
#endif
#if defined(RISCV_EABI)
        // set stack pointer
        asm volatile("la sp,_estack");
#endif

        // clear bss
        for (uint32_t *p = &_sbss; p < &_ebss; p++)
        {
            *p = 0;
        }

        // copy in data
        for (uint32_t *d = &_sdata, *s = &_sidata; d < &_edata; s++, d++)
        {
            *d = *s;
        }

        // copy in data2
        for (uint32_t *d = &_sdata2, *s = &_sidata2; d < &_edata2; s++, d++)
        {
            *d = *s;
        }

        // call static initializers
        __libc_init_array();

        // run our program
        main();

        // don't exit
        for (;;)
        {
        }
    }
}

#endif