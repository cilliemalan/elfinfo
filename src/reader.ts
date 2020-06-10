
// some nastiness to get fs without causing problems
// in either the browser or node
const inBrowser = new Function("try {return this===window;}catch(e){ return false;}")();

let fs: any;
if (!inBrowser && require) {
    try {
        fs = require('fs');
    } catch (e) { }
}

export interface Reader {
    read<TBuffer extends Uint8Array>(buffer: TBuffer, offset?: number | null, length?: number | null, position?: number | null): Promise<{ bytesRead: number, buffer: TBuffer }>;
    size(): Promise<number>;
    close(): Promise<void>;
}

function error_reader(message: string): Reader {
    return {
        read: (a, b, c, d) => Promise.reject(message),
        size: () => Promise.reject(message),
        close: () => Promise.reject(message)
    }
}

export function path(path: string): Reader {
    if (!fs) return error_reader('No filesystem');

    let fh = fs.promises.open(path, 'r');

    return {
        read: (a, b, c, d) => fh.then((x: any) => x.read(a, b, c, d)),
        size: () => fh.then((x: any) => x.stat()).then((s: any) => s.size),
        close: () => fh.then((x: any) => x.close())
    }
}

export function buffer<TBuffer extends Uint8Array>(buffer: TBuffer): Reader {
    const f = {
        src: Buffer.from(buffer),
        pos: 0,
        size: buffer.length
    }

    return {
        read: <TBuffer extends Uint8Array>(dest: TBuffer, offset?: number | null, length?: number | null, position?: number | null): Promise<{ bytesRead: number, buffer: TBuffer }> => {
            let updatepos = false;
            if (position === null || position === undefined) {
                position = f.pos;
                updatepos = true;
            }
            if (offset === null || offset === undefined) {
                offset = 0;
            }
            if (length === null || length === undefined) {
                // TODO: documentation doesn't specify this behaviour.
                length = dest.length - offset;
            }
            if (position <= f.size) {
                if (position + length > f.size) {
                    length = f.size - position;
                }

                if (length > 0) {
                    f.src.copy(dest, offset, position, length + position);
                } else {
                    length = 0;
                }

                if (updatepos) {
                    f.pos += length;
                }

                return Promise.resolve({ bytesRead: length, buffer: dest });
            } else {
                return Promise.reject("read past end of file");
            }
        },
        size: () => Promise.resolve(buffer.length),
        close: () => Promise.resolve()
    }
}

export function asyncfile(fh: any): Reader {
    if (!fs) return error_reader('No filesystem');

    return {
        read: fh.read.bind(fh),
        size: () => fh.stat().then((s: any) => s.size),
        close: () => Promise.resolve()
    }
}

export function syncfile(handle: number): Reader {
    if (!fs) return error_reader('No filesystem');

    return {
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
        close: () => Promise.resolve()
    };
}