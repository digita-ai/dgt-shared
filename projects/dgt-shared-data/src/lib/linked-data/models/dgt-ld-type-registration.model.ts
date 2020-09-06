import { DGTLDResource } from './dgt-ld-resource.model';
import { DGTLDPredicate } from './dgt-ld-predicate.model';


/** A thing that happens or takes place on someone's pod */
export interface DGTLDTypeRegistration extends DGTLDResource {
    forClass: DGTLDPredicate;
    instance: string;
}
