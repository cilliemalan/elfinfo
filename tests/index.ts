#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { AsyncLocalStorage } from 'async_hooks';
import { performance } from 'perf_hooks';

const { stdout, stderr, argv } = process;
let passed = 0, failed = 0;
let totaltime = 0;
const startTime = performance.now();

const tests: { name: string, fn: () => any }[] = [];

interface Category {
    name: string;
    prev?: Category;
}

const currentCategoryStorage = new AsyncLocalStorage<Category | undefined>();
const categoryPromises: { promise: Promise<void>, name: string }[] = [];

function getErrorMessage(e: any): string | undefined {
    return e ? (e.stack ?? (e.toString ? e.toString() : `${e}`)) : undefined;
}

function printErrorMessage(message: string | undefined) {
    if (message) {
        message = message.split('\n').map(l => `    ${l}`).join('\n');
        stderr.write(message, 'utf-8');
        stderr.write('\n', 'utf-8');
    }
}

function getTimeString(time?: number) {
    return time !== undefined && time > 100 ? ` (${time.toFixed(0)}ms)` : '';
}

function printStarting(name: string) {
    stdout.write(`👉 ${name}`, 'utf-8');
}

function printSuccess(name: string, time?: number) {
    stdout.write(`\r✔️  ${name}${getTimeString(time)}\n`, 'utf-8');
}

function printFailure(name: string, message?: string, time?: number) {
    stderr.write(`\r❌ ${name}${getTimeString(time)}\n`, 'utf-8');
    printErrorMessage(message);
}

export function category(name: string, stuff: () => void | Promise<void>) {

    const prev = currentCategoryStorage.getStore();

    if (prev) {
        name = `${prev.name} - ${name}`;
    }

    const promise = currentCategoryStorage.run({ name, prev }, stuff);
    if (promise) {
        categoryPromises.push({ promise, name });
    }
}

export function test(name: string, fn: () => any) {
    const category = currentCategoryStorage.getStore();
    if (category) {
        name = `${category.name} - ${name}`;
    }
    tests.push({ name, fn });
}

async function findTests() {
    const files = (await fs.readdir(__dirname))
        .filter(x => /^(?!index).+\.js$/.test(x));
    for (let test of files) {
        require(path.join(__dirname, test));
    }

    await Promise.allSettled(
        categoryPromises.map(({ promise, name }) =>
            promise.catch(e => {
                printFailure(name, getErrorMessage(e));
                failed++;
            })));
}

async function run() {

    const filter = argv[2] ? new RegExp(argv[2]) : undefined;
    const timeUntilRun = performance.now() - startTime;
    totaltime += timeUntilRun;
    const timeUntilRunStr = getTimeString(timeUntilRun)
    if (timeUntilRunStr) {
        stdout.write(`Bootstrapped tests${timeUntilRunStr}\n`, 'utf-8');
    }

    for (const { name, fn } of tests) {

        if (!filter || filter.test(name)) {

            let success = false;
            let errorMessage: string | undefined;
            let start = 0;
            let time = 0;
            try {
                printStarting(name);
                stdout.uncork();

                start = performance.now();
                const result = fn();
                if (result instanceof Promise) {
                    await result;
                }
                time = performance.now() - start;
                success = true;
            } catch (e: any) {
                time = performance.now() - start;
                success = false;
                errorMessage = getErrorMessage(e);
            }

            stdout.cork();
            stderr.cork();
            if (success) {
                printSuccess(name, time);
                passed++
            } else {
                printFailure(name, errorMessage, time);
                failed++;
            }
            stdout.uncork();
            stderr.uncork();
        }
    }

    if (failed) {
        stderr.write(`\n \x1b[1;5;91mFAILED\x1b[0m (\x1b[1;97m${failed}\x1b[0m tests failed, \x1b[1;97m${passed}\x1b[0m tests passed in ${(totaltime/1000).toFixed(2)}s)\n`);
        process.exit(1);
    } else {
        stdout.write(`\n \x1b[1;5;92mPASSED\x1b[0m (\x1b[1;97m${passed}\x1b[0m tests passed in ${(totaltime/1000).toFixed(2)}s)\n`);
        process.exit(0);
    }
}

(async () => {
    await findTests();
    await run();
})();