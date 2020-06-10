
import { Buffer } from 'buffer';

// in either the browser or node
const inBrowser = new Function("try {return this===window;}catch(e){ return false;}")();

let fs: any;
if (!inBrowser && require) {
    try {
        fs = require('fs');
    } catch (e) { }
}

function bufferRead<TBuffer extends Uint8Array>(state: { src: Buffer, pos: number, size: number }, dest: TBuffer, offset?: number | null, length?: number | null, position?: number | null): Promise<{ bytesRead: number, buffer: TBuffer }> {
    let updatepos = false;
    if (position === null || position === undefined) {
        position = state.pos;
        updatepos = true;
    }
    if (offset === null || offset === undefined) {
        offset = 0;
    }
    if (length === null || length === undefined) {
        // TODO: documentation doesn't specify this behaviour.
        length = dest.length - offset;
    }
    if (position <= state.size) {
        if (position + length > state.size) {
            length = state.size - position;
        }

        if (length > 0) {
            state.src.copy(dest, offset, position, length + position);
        } else {
            length = 0;
        }

        if (updatepos) {
            state.pos += length;
        }

        return Promise.resolve({ bytesRead: length, buffer: dest });
    } else {
        return Promise.reject("read past end of file");
    }
}

export interface Reader {
    open(): Promise<void>;
    read<TBuffer extends Uint8Array>(buffer: TBuffer, offset?: number | null, length?: number | null, position?: number | null): Promise<{ bytesRead: number, buffer: TBuffer }>;
    size(): Promise<number>;
    close(): Promise<void>;
}

function error_reader(message: string): Reader {
    return {
        open: () => Promise.reject(message),
        read: (a, b, c, d) => Promise.reject(message),
        size: () => Promise.reject(message),
        close: () => Promise.reject(message)
    }
}

export function path(path: string): Reader {
    if (!fs) return error_reader('No filesystem');

    const state: { fh: any } = { fh: null };

    return {
        open: () => fs.promises.open(path, 'r').then((fh: any) => { state.fh = fh }),
        read: (a, b, c, d) => state.fh.read(a, b, c, d),
        size: () => state.fh.stat().then((s: any) => s.size),
        close: () => state.fh.close()
    }
}

export function buffer<TBuffer extends Uint8Array>(buffer: TBuffer | ArrayBuffer): Reader {
    const state = {
        src: Buffer.from(buffer),
        pos: 0,
        size: buffer.byteLength
    }

    return {
        open: () => Promise.resolve(),
        size: () => Promise.resolve(state.size),
        close: () => Promise.resolve(),
        read: async (dest, offset, length, position) => bufferRead(state, dest, offset, length, position),
    }
}

export function asyncfile(fh: any): Reader {
    if (!fs) return error_reader('No filesystem');

    return {
        // open just checks if the file handle is still valid
        open: () => fh.stat().then(() => { }),
        read: fh.read.bind(fh),
        size: () => fh.stat().then((s: any) => s.size),
        // close does nothing since we don't own the handle
        close: () => Promise.resolve()
    }
}

export function syncfile(handle: number): Reader {
    if (!fs) return error_reader('No filesystem');

    return {
        open: () => new Promise((resolve, reject) => fs.fstat(handle, (e: any) => {
            // open just checks if the file handle is still valid
            if (e) {
                reject(e);
            } else {
                resolve();
            }
        })),
        read: (a, b, c, d) => new Promise((resolve, reject) =>
            fs.read(handle, a, b, c, d, (e: any, bytesRead: any, buffer: any) => {
                if (e) {
                    reject(e);
                } else {
                    resolve({ bytesRead, buffer });
                }
            })),
        size: () => new Promise((resolve, reject) => fs.fstat(handle, (e: any, stats: any) => {
            if (e) {
                reject(e);
            } else {
                resolve(stats.size);
            }
        })),
        // close does nothing since we don't own the handle
        close: () => Promise.resolve()
    };
}

export function blob(item: Blob): Reader {
    const state : { src: Buffer, pos: number, size: number } = {
        src: null,
        pos: 0,
        size: 0
    }

    return {
        open: () => item.arrayBuffer().then(ab=>{
            state.src = Buffer.from(ab);
            state.size = ab.byteLength;
        }),
        close: () => Promise.resolve(),
        size: () => Promise.resolve(state.size),
        read: async (dest, offset, length, position) => bufferRead(state, dest, offset, length, position),
    }
}
