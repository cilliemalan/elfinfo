
// pretend that we have node
declare var require: (id: string) => any;

interface StringDecoder {
    write(buffer: Uint8Array): string;
    end(buffer?: Uint8Array): string;
}

// pretend we have browser
interface TextDecoder {
    decode(input?: any, options?: any): string;
}
declare var TextDecoder: {
    prototype: TextDecoder;
    new(label?: string, options?: any): TextDecoder;
};

/** cross-environment utf-8 decode */
let _decode: ((array: Uint8Array, offset: number, length: number) => string) | undefined;
export function decode(array: Uint8Array, offset: number, length: number): string {
    if (_decode) {
        return _decode(array, offset, length);
    } else {
        throw new Error("There is no supported utf-8 decoder");
    }
}

if (typeof require !== undefined) {
    let decoder: StringDecoder | undefined;
    try {
        const { StringDecoder } = require('string_decoder') as { StringDecoder: any };
        const decoder = new StringDecoder('utf8') as StringDecoder;
        if (decoder) {
            _decode = (array: Uint8Array, offset: number, length: number) => {
                return decoder.end(array.subarray(offset, offset + length));
            }
        }
    } catch (e) {
    }
}

if (_decode === undefined && typeof TextDecoder !== 'undefined') {
    const decoder = new TextDecoder();
    _decode = (array: Uint8Array, offset: number, length: number) => {
        return decoder.decode(array.subarray(offset, offset + length));
    }
}
