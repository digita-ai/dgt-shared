import { DGTSourceSolidTrustedAppMode } from './dgt-source-solid-trusted-app-mode.model';
import { DGTLDEntity } from '@digita/dgt-shared-data';

/**
 * An app which has access to a pod.
 */
export interface DGTSourceSolidTrustedApp extends DGTLDEntity {
    origin: string;
    modes: DGTSourceSolidTrustedAppMode[];
}