import { FileHandle, open as fsopen } from "fs/promises";
import * as fs from 'fs';
import { stringify } from "querystring";

interface BufferState {
    array?: ArrayBuffer,
    offset: number;
    size: number;
    position: number;
}

function bufferRead(state: BufferState, length: number, position?: number): Promise<Uint8Array> {
    let updatepos = false;
    const { array } = state;

    if (!array) {
        return Promise.reject("state.array must be defined");
    }
    if (!length) {
        return Promise.reject('Length must be specified');
    }

    if (!position) {
        position = state.position;
        updatepos = true;
    }

    if (position <= state.size) {

        if (position + length > state.size) {
            length = state.size - position;
        }

        if (length < 0) {
            length = 0;
        }

        if (updatepos) {
            state.position += length;
        }

        return Promise.resolve(new Uint8Array(array, state.offset + position, length));
    } else {
        return Promise.reject("read past end of file");
    }
}

async function asyncFileRead(file: FileHandle | undefined, length: number, position?: number): Promise<Uint8Array> {
    if (!file) throw "File not open";
    const result = new Uint8Array(length);
    const { bytesRead } = await file.read(result, 0, length, position);
    if (bytesRead < length) {
        return result.slice(0, bytesRead);
    } else {
        return result;
    }
}

function syncFileRead(file: number, length: number, position?: number): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        const result = new Uint8Array(length);
        fs.read(file, result, 0, length, position ?? null,
            (err: any, bytesRead: number) => {
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

/** 
 * An abstract interface for a file-reading interface. This is used
 * by the ELF parser to read the file from many different sources.
 */
export interface Reader {
    /** The path of the file, if it is a file. */
    path?: string,
    /** Called to open the data source asynchronously. */
    open(): Promise<void>;
    /**
     * Called to read data from the data source.
     * @param length The amount of data to read.
     * @param position If specified, seek to this position first.
     */
    read(length: number, position?: number): Promise<Uint8Array>;
    /**
     * Called to return a data view interface to the data source.
     * @param length The size of the data view.
     * @param position The position of the data view.
     */
    view(length: number, position?: number): Promise<DataView>;
    /** Returns the size of the data source */
    size(): number;
    /** Closes the data source */
    close(): Promise<void>;
}

function error_reader(message: string): Reader {
    return {
        open: () => Promise.reject(message),
        read: (a, b) => Promise.reject(message),
        view: (a, b) => Promise.reject(message),
        size: () => -1,
        close: () => Promise.reject(message)
    }
}

export function array(array: Array<number>): Reader {
    return buffer(Uint8Array.from(array));
}

export function buffer<TBuffer extends Uint8Array>(buffer: TBuffer | ArrayBuffer): Reader {
    const state: BufferState = {
        array: buffer instanceof Uint8Array ? buffer.buffer : buffer,
        offset: 0,
        position: 0,
        size: buffer.byteLength
    };

    if (buffer instanceof Uint8Array) {
        state.offset = buffer.byteOffset;
    }

    return {
        open: () => Promise.resolve(),
        size: () => state.size,
        close: () => Promise.resolve(),
        read: (length, position) => bufferRead(state, length, position),
        view: (length, position) => bufferRead(state, length, position).then(createView),
    }
}

export function asyncfile(fh: FileHandle, ownshandle?: boolean): Reader {
    if (!fs) return error_reader('No filesystem');

    const state = { fh, size: 0, ownshandle };
    return {
        // open checks if the file handle is still valid
        // and gets the size
        open: () => state.fh.stat().then(ss => { state.size = ss.size; }),
        read: (length, position) => asyncFileRead(state.fh, length, position),
        view: (length, position) => asyncFileRead(state.fh, length, position).then(createView),
        size: () => state.size,
        close: () => state.ownshandle ? state.fh.close() : Promise.resolve()
    }
}

export function syncfile(handle: number, ownshandle?: boolean): Reader {
    if (!fs) return error_reader('No filesystem');

    const state = { ownshandle, handle, size: 0 };
    return {
        open: () => new Promise((resolve, reject) => fs.fstat(state.handle, (e, ss) => {
            // open just checks if the file handle is still valid
            if (e) {
                reject(e);
            } else {
                state.size = ss.size;
                resolve();
            }
        })),
        read: (length, position) => syncFileRead(state.handle, length, position),
        view: (length, position) => syncFileRead(state.handle, length, position).then(createView),
        size: () => state.size,
        close: () => new Promise((resolve, reject) => {
            if (state.ownshandle) {
                fs.close(state.handle, e => {
                    if (e) {
                        reject(e);
                    } else {
                        resolve();
                    }
                })
            } else {
                resolve();
            }
        })
    };
}

export function file(path: string): Reader {
    if (!fs) return error_reader('No filesystem');

    const state = { path, fh: undefined as FileHandle | undefined, size: 0 };
    return {
        open: () => fsopen(state.path, 'r')
            .then(fh => {
                state.fh = fh;
                return fh.stat().then(ss => { state.size = ss.size });
            }),
        read: (length, position) => asyncFileRead(state.fh, length, position),
        view: (length, position) => asyncFileRead(state.fh, length, position).then(createView),
        size: () => state.size,
        close: () => state.fh ? state.fh.close() : Promise.resolve()
    }
}

/** Blob for the browser and future node */
export interface Blob {
    readonly size: number;
    arrayBuffer(): Promise<ArrayBuffer>;
}

export function blob(item: Blob): Reader {
    const state: BufferState = {
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
        size: () => state.size,
        read: (length, position) => bufferRead(state, length, position),
        view: (length, position) => bufferRead(state, length, position).then(createView),
    }
}