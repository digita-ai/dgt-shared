// tslint:disable:no-bitwise
// tslint:disable:triple-equals

import { DGTLoggerService } from '../../logging/services/dgt-logger.service';

export class DGTFile {
    private static logger: DGTLoggerService = new DGTLoggerService();
    private logger: DGTLoggerService = new DGTLoggerService();

    public static fromBase64(type: string, base64: string): DGTFile {
        let res: DGTFile = null;

        this.logger.debug(DGTFile.name, 'Creating image from base 64.');

        if (type && base64) {
            const binary = atob(base64);

            const len = binary.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            if (bytes.buffer instanceof ArrayBuffer) {
                res = new DGTFile(type, bytes.buffer as ArrayBuffer);
            }
        }

        return res;
    }

    public static fromBuffer(type: string, bufferArray: Array<Buffer>): DGTFile {
        let res: DGTFile = null;

        this.logger.debug(DGTFile.name, 'Start creating image from buffer.');

        if (type && bufferArray && bufferArray[0]) {
            this.logger.debug(DGTFile.name, 'Type and buffer array found.');

            const buffer = Buffer.concat(bufferArray);
            const arrayBuffer: ArrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
            // const arrayBufferView: Uint8Array = new Uint8Array(arrayBuffer);
            // for (let i = 0; i < bufferArray.length; ++i) {
            //     arrayBufferView[i] = bufferArray[i].readUInt8(bufferArray[i].byteOffset);
            // }

            res = new DGTFile(type, arrayBuffer);
        }

        this.logger.debug(DGTFile.name, 'Finished creating image from buffer.');

        return res;
    }

    public static fromBlob(type: string, blob: Blob): DGTFile {
        let res: DGTFile = null;

        this.logger.debug(DGTFile.name, 'Starting creating image from blob.');

        if (type && blob) {
            // let arrayBuffer;
            const fileReader = new FileReader();
            // fileReader.onload = function (event) {
            //     arrayBuffer = event.target.result;
            // };
            fileReader.readAsArrayBuffer(blob);
            const readResult = fileReader.result;

            if (readResult && readResult instanceof ArrayBuffer) {
                res = new DGTFile(type, readResult as ArrayBuffer);
            }
        }

        this.logger.debug(DGTFile.name, 'Finished creating image from blob.');

        return res;
    }

    public static fromArrayBuffer(type: string, arrayBuffer: ArrayBuffer) {
        let res: DGTFile = null;

        this.logger.debug(DGTFile.name, 'Creating image from array buffer.');

        if (type && arrayBuffer) {
            res = new DGTFile(type, arrayBuffer);
        }

        return res;
    }

    private constructor(public type: string, public data: ArrayBuffer) { }

    // public get asBase64(): string {
    //     let res = null;

    //     if (this.data) {
    //         // res = this.base64ArrayBuffer(this.data);
    //         // res = btoa(String.fromCharCode.apply(null, new Uint8Array(this.data)));

    //         let binary = '';
    //         const bytes = new Uint8Array(this.data);
    //         const len = bytes.byteLength;
    //         for (let i = 0; i < len; i++) {
    //             binary += String.fromCharCode(bytes[i]);
    //         }

    //         if (!window || !window.btoa) {
    //             res = btoa(binary);
    //         } else {
    //             res = window.btoa(binary);
    //         }
    //     }

    //     this.logger.debug(DGTFile.name, 'Parsed file as base 64.');

    //     return res;
    // }

    public get asBlob(): Blob {
        let res: Blob = null;

        if (this.data) {
            res = new Blob([this.data]);
        }

        this.logger.debug(DGTFile.name, 'Parsed file as blob.');

        return res;
    }

    // public get asDataUrl(): string {
    //     let res: string = null;

    //     if (this.type && this.data) {
    //         res = `data:${this.type};base64,${this.asBase64}`;
    //     }

    //     this.logger.debug(DGTFile.name, 'Parsed file as data url.');

    //     return res;
    // }

    private base64ArrayBuffer(arrayBuffer: ArrayBuffer) {
        let base64 = '';
        const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

        const bytes = new Uint8Array(arrayBuffer);
        const byteLength = bytes.byteLength;
        const byteRemainder = byteLength % 3;
        const mainLength = byteLength - byteRemainder;

        this.logger.debug(DGTFile.name, 'Calculating basic variabled.');

        let a;
        let b;
        let c;
        let d;
        let chunk;

        // Main loop deals with bytes in chunks of 3
        for (let i = 0; i < mainLength; i = i + 3) {
            // Combine the three bytes into a single integer
            // tslint:disable-next-line:no-bitwise
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
            c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
            d = chunk & 63;               // 63       = 2^6 - 1

            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
        }

        // Deal with the remaining bytes and padding
        if (byteRemainder == 1) {
            chunk = bytes[mainLength];

            a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

            // Set the 4 least significant bits to zero
            b = (chunk & 3) << 4; // 3   = 2^2 - 1

            base64 += encodings[a] + encodings[b] + '==';
        } else if (byteRemainder == 2) {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

            a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
            b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

            // Set the 2 least significant bits to zero
            c = (chunk & 15) << 2; // 15    = 2^4 - 1

            base64 += encodings[a] + encodings[b] + encodings[c] + '=';
        }

        return base64;
    }
}
