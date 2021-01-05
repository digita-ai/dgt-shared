import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

/** Representation of a user's profile */
export interface DGTProfile extends DGTLDResource {
    avatar: string;
    fullName: string;
    publicTypeIndex: string;
    privateTypeIndex: string;
}
