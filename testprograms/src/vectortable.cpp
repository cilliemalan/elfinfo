#if defined(ARM_EABI)

#include <stdint.h>

typedef void (*isr_handler)();

extern "C"
{
    extern uint32_t _estack;
    void Reset_Handler();

    void Default_Handler()
    {
    }

    void Fault_Handler()
    {
        for (;;)
        {
        }
    }
}

#define WEAK_ALIAS(n) __attribute__((weak, alias(n)))

extern "C"
{
    // generic ARM Cortex handlers
    void NMI_Handler() WEAK_ALIAS("Fault_Handler");
    void HardFault_Handler() WEAK_ALIAS("Fault_Handler");
    void MemManage_Handler() WEAK_ALIAS("Fault_Handler");
    void BusFault_Handler() WEAK_ALIAS("Fault_Handler");
    void UsageFault_Handler() WEAK_ALIAS("Fault_Handler");
    void SVC_Handler() WEAK_ALIAS("Default_Handler");
    void DebugMon_Handler() WEAK_ALIAS("Default_Handler");
    void PendSV_Handler() WEAK_ALIAS("Default_Handler");
    void SysTick_Handler() WEAK_ALIAS("Default_Handler");
}

// vector table definition
extern "C" const isr_handler isr_vector[32] __attribute__((section(".vectortable.isr"))) =
    {
        (isr_handler)(&_estack),
        Reset_Handler,
        NMI_Handler,
        HardFault_Handler,
        MemManage_Handler,
        BusFault_Handler,
        UsageFault_Handler,
        0,
        0,
        0,
        0,
        SVC_Handler,
        DebugMon_Handler,
        0,
        PendSV_Handler,
        SysTick_Handler,
        0};

#endif