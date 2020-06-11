/* Entry Point */
ENTRY(Reset_Handler)

MEMORY
{
    RAM (xrw)      : ORIGIN = 0x20000000, LENGTH = 64K
    FLASH (rx)      : ORIGIN = 0x08000000, LENGTH = 256K
}

_estack = ORIGIN(RAM) + LENGTH(RAM);    /* end of RAM */

/* Define output sections */
SECTIONS
{

  /* ISR vector table */
  .vectortable :
  {
    KEEP(*(.vectortable.isr))
    . = ALIGN(256);
  } >FLASH

  /* Code */
  .text :
  {
    . = ALIGN(4);
    *(.startup)
    *(.text)
    *(.text*)
    *(.glue_7)
    *(.glue_7t)
    *(.eh_frame)

    KEEP (*(.init))
    KEEP (*(.fini))

    . = ALIGN(4);
    _etext = .;
  } >FLASH

  /* read-only data */
  .rodata :
  {
    . = ALIGN(4);
    *(.rodata)
    *(.rodata*)
    . = ALIGN(4);
  } >FLASH

  /* arm stuff */
  .ARM.extab   :
  {
    *(.ARM.extab* .gnu.linkonce.armextab.*)
  } >FLASH
  .ARM :
  {
    __exidx_start = .;
    *(.ARM.exidx*)
    __exidx_end = .;
  } >FLASH

  /* initialization stuff */
  .preinit_array     :
  {
    PROVIDE_HIDDEN (__preinit_array_start = .);
    KEEP (*(.preinit_array*))
    PROVIDE_HIDDEN (__preinit_array_end = .);
  } >FLASH
  .init_array :
  {
    PROVIDE_HIDDEN (__init_array_start = .);
    KEEP (*(SORT(.init_array.*)))
    KEEP (*(.init_array*))
    PROVIDE_HIDDEN (__init_array_end = .);
  } >FLASH
  .fini_array :
  {
    PROVIDE_HIDDEN (__fini_array_start = .);
    KEEP (*(SORT(.fini_array.*)))
    KEEP (*(.fini_array*))
    PROVIDE_HIDDEN (__fini_array_end = .);
  } >FLASH

  /* data (copied to memory on startup) */
  _sidata = LOADADDR(.data);
  .data :
  {
    . = ALIGN(4);
    _sdata = .;
    *(.data)
    *(.data*)
    *(.datatext)

    . = ALIGN(4);
    _edata = .;
  } >RAM AT >FLASH

  /* data (zeroed on startup) */
  . = ALIGN(4);
  .bss :
  {
    _sbss = .;
    __bss_start__ = _sbss;
    *(.bss)
    *(.bss*)
    *(COMMON)

    . = ALIGN(4);
    _ebss = .;
    __bss_end__ = _ebss;
    __heap_start__ = .;
    __heap_end__ = ORIGIN(RAM) + LENGTH(RAM);
    
    . = ALIGN(4);
  } >RAM
  
  _sidata2 = LOADADDR(.dat2);
  .dat2 :
  {
    . = ALIGN(4);
    _sdata2 = .;
    *(.dat2)
    *(.dat2*)
    . = ALIGN(4);
    _edata2 = .;
  } >RAM AT >FLASH

  /* discard some things */
  /DISCARD/ :
  {
    libc.a ( * )
    libm.a ( * )
    libgcc.a ( * )
  }

  /* shrug */
  .ARM.attributes 0 :
  {
    *(.ARM.attributes)
  }
}