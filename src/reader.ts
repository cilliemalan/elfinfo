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
    size(): Promise<number>;
    /** Closes the data source */
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
        size: () => Promise.resolve(state.size),
        close: () => Promise.resolve(),
        read: (length, position) => bufferRead(state, length, position),
        view: (length, position) => bufferRead(state, length, position).then(createView),
    }
}
