import { forkJoin, from, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DGTCryptoKeyPair } from '../models/dgt-crypto-key-pair.model';
import { DGTCryptoService } from './dgt-crypto.service';

export class DGTCryptoBrowserService extends DGTCryptoService {

  constructor() {

    super();

  }

  generateKeyPair(): Observable<DGTCryptoKeyPair> {

    return from(crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([ 0x01, 0x00, 0x01 ]),
        hash: { name: 'SHA-256' },
      },
      true,
      [ 'sign', 'verify' ],
    ))
      .pipe(
        switchMap((data) => forkJoin(
          crypto.subtle.exportKey('jwk', data.publicKey),
          crypto.subtle.exportKey('jwk', data.privateKey),
        )),
        map((data) => {

          const [ publicJwk, privateJwk ] = data;

          return { publicKey: publicJwk, privateKey: privateJwk };

        }),
      );

  }

  digest(data: Uint8Array): Observable<ArrayBuffer> {

    return from(crypto.subtle.digest({ name: 'SHA-256' }, data));

  }

  generateRandomNumbers(length: number): number[] {

    return Array.from(crypto.getRandomValues(new Uint8Array(length)));

  }

}
