import { DGTLDResource } from '@digita-ai/dgt-shared-data';
import { DGTSourceSolidTrustedAppMode } from './dgt-source-solid-trusted-app-mode.model';

/**
 * An app which has access to a pod.
 */
export interface DGTSourceSolidTrustedApp extends DGTLDResource {
    origin: string;
    modes: DGTSourceSolidTrustedAppMode[];
}
