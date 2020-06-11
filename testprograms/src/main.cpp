
#include <stdio.h>
#include "factorial.h"

extern "C" uint8_t globalbssdata[10];
extern "C" const char globalrodatastring[];
extern "C" char globaldatastring[];


uint8_t globalbssdata[10] = {0};
const char globalrodatastring[] = "Hello World";
char globaldatastring[] = "Hello World #X";

__attribute__((section(".dat2")))
char globaldatastring2[] = "Wello Horld #X";

extern "C" int main(int argc, const char *argv[])
{
    for (int i = 0; i < sizeof(globalbssdata); i++)
    {
        globalbssdata[i] = static_cast<uint8_t>(i + 1);
    }

    static const char rodatastring[] = "Hello World";
    static char datastring[] = "Hello World #X";
    printf("%s: %d\n", "Integer Factorial", factoriali(5));
    printf("%s: %f\n", "Float Factorial", factorialf(5));

    printf("%s: %s\n", "rodata string", rodatastring);
    datastring[sizeof(datastring) - 2] = '5';
    printf("%s: %s\n", "data string", datastring);
    
    printf("%s: %s\n", "global rodata string", globalrodatastring);
    globaldatastring[13] = '5';
    printf("%s: %s\n", "global data string", globaldatastring);
    
    globaldatastring2[13] = '5';
    printf("%s: %s\n", "global data string", globaldatastring2);
    return 0;
}
