import { DGTCryptoService } from './dgt-crypto.service';
import { from, forkJoin, Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { DGTLoggerService } from '../../logging/services/dgt-logger.service';

@Injectable()
export class DGTCryptoBrowserService extends DGTCryptoService {

    constructor(private logger: DGTLoggerService) {
        super();
    }

    public generateKeyPair(): Observable<{ public: JsonWebKey, private: JsonWebKey }> {
        this.logger.debug(DGTCryptoBrowserService.name, 'Generating key pair');

        return from(crypto.subtle.generateKey(
            {
                name: 'RSASSA-PKCS1-v1_5',
                modulusLength: 2048,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: { name: 'SHA-256' },
            },
            true,
            ['sign', 'verify']
        ))
            .pipe(
                switchMap(data => forkJoin(
                    crypto.subtle.exportKey('jwk', data.publicKey),
                    crypto.subtle.exportKey('jwk', data.privateKey)
                )),
                map(data => {
                    const [publicJwk, privateJwk] = data;

                    return { public: publicJwk, private: privateJwk };
                })
            );
    }

    public digest(data: Uint8Array): Observable<ArrayBuffer> {
        this.logger.debug(DGTCryptoBrowserService.name, 'Calculating digest', { data });

        return from(crypto.subtle.digest({ name: 'SHA-256' }, data));
    }

    public generateRandomNumbers(length: number): number[] {
        this.logger.debug(DGTCryptoBrowserService.name, 'Generating random numbers', { length });

        return Array.from(crypto.getRandomValues(new Uint8Array(length)));
    }
}