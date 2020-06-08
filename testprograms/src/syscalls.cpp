#if defined(ARM_EABI) || defined(RISCV_EABI)

#include <sys/stat.h>
#include <sys/types.h>
#include <stdlib.h>
#include <errno.h>
#include <stdio.h>
#include <signal.h>
#include <time.h>
#include <stddef.h>
#include <stdint.h>

static volatile char* usart_dr = reinterpret_cast<char*>(0x4000c000);

extern "C"
{
// definitions
#ifdef errno
#undef errno
#endif
#ifdef __env
#undef __env
#endif
#ifdef environ
#undef environ
#endif
    extern int errno;
    char *__env[1] = {0};
    char **environ = __env;

    int __io_putchar(int ch);
    int __io_getchar(void);
    int _getpid(void);
    int _kill(int pid, int sig);
    void _exit(int status);
    int _read(int file, char *ptr, int len);
    int _write(int file, char *ptr, int len);
    int _close(int file);
    int _fstat(int file, struct stat *st);
    int _isatty(int file);
    int _lseek(int file, int ptr, int dir);
    int _open(char *path, int flags, ...);
    int _wait(int *status);
    int _unlink(char *name);
    int _times(struct tms *buf);
    int _stat(char *file, struct stat *st);
    int _tell(int file);
    int _link(char *old, char *_new);
    int _fork(void);
    int _execve(char *name, char **argv, char **env);
    caddr_t _sbrk(int incr);
    void *_malloc(size_t sz);
    void *malloc(size_t sz);
    void _free(void *p);
    void free(void *p);

    void __cxa_pure_virtual();
}

int __io_putchar(int ch)
{
    *usart_dr = static_cast<char>(ch);
    return 1;
}

int __io_getchar(void)
{
    return *usart_dr;
}

int _getpid(void)
{
    return 1;
}

int _kill(int pid, int sig)
{
    errno = EINVAL;
    return -1;
}

void _exit(int status)
{
    _kill(status, -1);
    while (1)
    {
    }
}

int _read(int file, char *ptr, int len)
{
    return -1;
}

int _write(int file, char *ptr, int len)
{
    uint32_t timeout = len * 100 / 1000;
    if (timeout == 0)
        timeout = 1;
    return len;
}

int _close(int file)
{
    return -1;
}

int _fstat(int file, struct stat *st)
{
    st->st_mode = S_IFCHR;
    return 0;
}

int _isatty(int file)
{
    return 1;
}

int _lseek(int file, int ptr, int dir)
{
    return 0;
}

int _open(char *path, int flags, ...)
{
    /* Pretend like we always fail */
    return -1;
}

int _wait(int *status)
{
    errno = ECHILD;
    return -1;
}

int _unlink(char *name)
{
    errno = ENOENT;
    return -1;
}

int _times(struct tms *buf)
{
    return -1;
}

int _stat(char *file, struct stat *st)
{
    st->st_mode = S_IFCHR;
    return 0;
}

int _link(char *old, char *_new)
{
    errno = EMLINK;
    return -1;
}

int _fork(void)
{
    errno = EAGAIN;
    return -1;
}

int _execve(char *name, char **argv, char **env)
{
    errno = ENOMEM;
    return -1;
}

extern char __heap_start__;
extern char __heap_end__;
char *heap_ptr = 0;
caddr_t _sbrk(int incr)
{
    if (!heap_ptr)
    {
        heap_ptr = &__heap_start__;
    }

    char *prev_ptr = heap_ptr;
    char *new_ptr = prev_ptr + incr;

    if (new_ptr > &__heap_end__)
    {
        errno = ENOMEM;
        return (caddr_t)-1;
    }

    heap_ptr = new_ptr;
    return prev_ptr;
}

void __cxa_pure_virtual()
{
    for(;;){}
}

#endif