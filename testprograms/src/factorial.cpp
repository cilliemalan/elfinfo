#include "factorial.h"

int factoriali(int n)
{
    int result = 1;
    for (int i = 1; i <= n; ++i)
        result *= i;
    return result;
} 

float factorialf(float n)
{
    return n == 0 ? 1 : n * factorialf(n - 1);
}
