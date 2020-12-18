import { DGTLDResource } from './dgt-ld-resource.model';

/** A thing that happens or takes place on someone's pod */
export interface DGTLDTypeRegistration extends DGTLDResource {
    forClass: string;
    instance: string;
}
