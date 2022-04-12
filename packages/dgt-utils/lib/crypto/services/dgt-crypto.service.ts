import { getLoggerFor, Logger } from '@digita-ai/handlersjs-logging';
import { Observable } from 'rxjs';

import { DGTCryptoKeyPair } from '../models/dgt-crypto-key-pair.model';

export abstract class DGTCryptoService {

  protected logger: Logger = getLoggerFor(this, 5, 5);

  public abstract digest(data: Uint8Array): Observable<ArrayBuffer>;
  public abstract generateKeyPair(): Observable<DGTCryptoKeyPair>;
  public abstract generateRandomNumbers(length: number): number[];

}
