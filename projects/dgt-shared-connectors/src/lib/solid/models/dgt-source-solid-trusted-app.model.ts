import { DGTSourceSolidTrustedAppMode } from './dgt-source-solid-trusted-app-mode.model';
import { DGTLDResource } from '@digita/dgt-shared-data';

/**
 * An app which has access to a pod.
 */
export interface DGTSourceSolidTrustedApp extends DGTLDResource {
    origin: string;
    modes: DGTSourceSolidTrustedAppMode[];
}