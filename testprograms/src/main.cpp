
#include <stdio.h>
#include "factorial.h"


extern "C" int main(int argc, const char* argv[])
{
    printf("%s: %d\n", "Integer Factorial", factoriali(5));
    printf("%s: %f\n", "Float Factorial", factorialf(5));
    return 0;
}
