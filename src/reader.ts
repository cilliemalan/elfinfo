import { FileHandle } from "fs/promises";
import * as fs from 'fs';

interface BufferState {
    array: ArrayBuffer,
    offset: number;
    size: number;
    position: number;
}

function bufferRead(state: BufferState, length?: number | null, position?: number | null): Promise<Uint8Array> {
    let updatepos = false;
    if (position === null || position === undefined) {
        position = state.position;
        updatepos = true;
    }
    if (length === null || length === undefined) {
        return Promise.reject('Length must be specified');
    } else if (position <= state.size) {

        if (position + length > state.size) {
            length = state.size - position;
        }

        if (length < 0) {
            length = 0;
        }

        if (updatepos) {
            state.position += length;
        }

        return Promise.resolve(new Uint8Array(state.array, state.offset + position, length));
    } else {
        return Promise.reject("read past end of file");
    }
}

async function asyncFileRead(file: FileHandle, length?: number | null, position?: number | null): Promise<Uint8Array> {
    const result = new Uint8Array(length);
    const { bytesRead } = await file.read(result, 0, length, position);
    if (bytesRead < length) {
        return result.slice(0, bytesRead);
    } else {
        return result;
    }
}

function syncFileRead(file: number, length?: number | null, position?: number | null): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        const result = new Uint8Array(length);
        fs.read(file, result, 0, length, position, (err: any, bytesRead: number) => {
            if (err) {
                reject(err);
            } else {
                if (bytesRead < length) {
                    resolve(result.slice(0, bytesRead))
                } else {
                    resolve(result);
                }
            }
        });
    })
}

function createView(from: Uint8Array): DataView {
    return new DataView(from.buffer, from.byteOffset, from.byteLength);
}

export interface Reader {
    open(): Promise<void>;
    read(length?: number | null, position?: number | null): Promise<Uint8Array>;
    view(length?: number | null, position?: number | null): Promise<DataView>;
    size(): Promise<number>;
    close(): Promise<void>;
}

function error_reader(message: string): Reader {
    return {
        open: () => Promise.reject(message),
        read: (a, b) => Promise.reject(message),
        view: (a, b) => Promise.reject(message),
        size: () => Promise.reject(message),
        close: () => Promise.reject(message)
    }
}

export function path(path: string): Reader {
    if (!fs) return error_reader('No filesystem');

    const state: { fh: any } = { fh: null };
    return {
        open: () => fs.promises.open(path, 'r').then((fh: any) => { state.fh = fh }),
        read: (length, position) => asyncFileRead(state.fh, length, position),
        view: (length, position) => asyncFileRead(state.fh, length, position).then(createView),
        size: () => state.fh.stat().then((s: any) => s.size),
        close: () => state.fh.close()
    }
}

export function array(array: Array<number>): Reader {
    return buffer(Uint8Array.from(array));
}

export function buffer<TBuffer extends Uint8Array>(buffer: TBuffer | ArrayBuffer): Reader {
    const state: BufferState = {
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
        read: (length, position) => bufferRead(state, length, position),
        view: (length, position) => bufferRead(state, length, position).then(createView),
    }
}

export function asyncfile(fh: any): Reader {
    if (!fs) return error_reader('No filesystem');

    return {
        // open just checks if the file handle is still valid
        open: () => fh.stat().then(() => { }),
        read: (length, position) => asyncFileRead(fh, length, position),
        view: (length, position) => asyncFileRead(fh, length, position).then(createView),
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
        read: (length, position) => syncFileRead(handle, length, position),
        view: (length, position) => syncFileRead(handle, length, position).then(createView),
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
    const state: BufferState = {
        array: null,
        offset: 0,
        position: 0,
        size: 0
    }

    return {
        open: () => item.arrayBuffer().then(ab => {
            state.array = ab;
            state.offset = 0;
            state.position = 0;
            state.size = ab.byteLength;
        }),
        close: () => Promise.resolve(),
        size: () => Promise.resolve(state.size),
        read: (length, position) => bufferRead(state, length, position),
        view: (length, position) => bufferRead(state, length, position).then(createView),
    }
}
