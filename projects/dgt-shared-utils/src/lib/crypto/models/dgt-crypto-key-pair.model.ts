import { DGTCryptoKey } from './dgt-crypto-key.model';

export interface DGTCryptoKeyPair {
    publicKey: DGTCryptoKey,
    privateKey: DGTCryptoKey,
}