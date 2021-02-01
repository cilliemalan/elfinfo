#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { AsyncLocalStorage } from 'async_hooks';

const tests: { name: string, fn: () => any }[] = [];

interface Category {
    name: string;
    prev?: Category;
}

const currentCategoryStorage = new AsyncLocalStorage<Category | undefined>();

export function category(name: string, stuff: () => void | Promise<void>) {

    const prev = currentCategoryStorage.getStore();

    if (prev) {
        name = `${prev.name} - ${name}`;
    }

    currentCategoryStorage.run({ name, prev }, stuff);
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
}

async function run() {
    const { stdout, stderr } = process;
    let passed = 0, failed = 0;
    for (const { name, fn } of tests) {
        let success = false;
        let stack: string | undefined;
        try {
            stdout.write(`👉 ${name}`, 'utf-8');
            stdout.uncork();

            const result = fn();
            if (result instanceof Promise) {
                await result;
            }
            success = true;
        } catch (e) {
            success = false;
            stack = e ? (e.stack ?? (e.toString ? e.toString() : `${e}`)) : undefined;
        }

        stdout.cork();
        stderr.cork();
        if (success) {
            stdout.write('\r✔️\n', 'utf-8');
            passed++
        } else {
            stderr.write('\r❌\n', 'utf-8');
            failed++;
            if (stack) {
                stack = stack.split('\n').map(l => `    ${l}`).join('\n');
                stderr.write(stack, 'utf-8');
                stderr.write('\n', 'utf-8');
            }
        }
        stdout.uncork();
        stderr.uncork();
    }

    if (failed) {
        stderr.write(`\n \x1b[1;5;91mFAILED\x1b[0m (\x1b[1;97m${failed}\x1b[0m tests failed, \x1b[1;97m${passed}\x1b[0m tests passed)\n`);
        process.exit(1);
    } else {
        stdout.write(`\n \x1b[1;5;92mPASSED\x1b[0m (\x1b[1;97m${passed}\x1b[0m tests passed)\n`);
        process.exit(0);
    }
}

(async () => {
    await findTests();
    await run();
})();