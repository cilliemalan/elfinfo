// in either the browser or node
const inBrowser = new Function("try {return this===window;}catch(e){ return false;}")();

let fs: any;
if (!inBrowser && require) {
    try {
        fs = require('fs');
    } catch (e) { }
}

interface BufferState {
    array: ArrayBuffer,
    offset: number;
    size: number;
    position: number;
}

function bufferRead<TBuffer extends Uint8Array>(state: BufferState, dest: TBuffer, offset?: number | null, length?: number | null, position?: number | null): Promise<{ bytesRead: number, buffer: TBuffer }> {
    let updatepos = false;
    if (position === null || position === undefined) {
        position = state.position;
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
            dest.set(new Uint8Array(state.array, state.offset + position, length), offset);
        } else {
            length = 0;
        }

        if (updatepos) {
            state.position += length;
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
    const state : BufferState = {
        array: null,
        offset: 0,
        position: 0,
        size: buffer.byteLength
    };

    if (buffer instanceof Uint8Array) {
        state.array = buffer.buffer;
        state.offset = buffer.byteOffset;
    } else {
        state.array = buffer;
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
    const state : BufferState = {
        array: null,
        offset: 0,
        position: 0,
        size: 0
    }

    return {
        open: () => item.arrayBuffer().then(ab=>{
            state.array = ab;
            state.offset = 0;
            state.position = 0;
            state.size = ab.byteLength;
        }),
        close: () => Promise.resolve(),
        size: () => Promise.resolve(state.size),
        read: async (dest, offset, length, position) => bufferRead(state, dest, offset, length, position),
    }
}
