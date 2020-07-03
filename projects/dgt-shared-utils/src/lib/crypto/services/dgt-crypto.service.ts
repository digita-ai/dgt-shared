import { Observable } from 'rxjs';

export abstract class DGTCryptoService {
    public abstract digest(data: Uint8Array): Observable<ArrayBuffer>;
    public abstract generateKeyPair(): Observable<{ public: JsonWebKey, private: JsonWebKey }>;
    public abstract generateRandomNumbers(length: number): number[];
}