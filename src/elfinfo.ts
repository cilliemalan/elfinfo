#!/usr/bin/env node
import { open } from './';
import { debug } from './debug';

(async function main() {
    const programs = process.argv.slice(2);

    if (programs.length) {
        for (const program of programs) {
            const elf = await open(program);
            console.log(debug(elf));
            console.log('\n\n');
        }
    } else {
        console.log(`Usage: elfinfo [program]`)
    }
})().catch(console.error);