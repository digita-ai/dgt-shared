import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

export interface DGTConnectorType extends DGTLDResource {
    label: string;
    description: string;
    group: string;
    icon: string;
}
