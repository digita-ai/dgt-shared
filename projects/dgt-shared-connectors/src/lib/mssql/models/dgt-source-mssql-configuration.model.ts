import { DGTMap } from '@digita/dgt-shared-utils';
import { DGTLDField } from '@digita/dgt-shared-data';

export interface DGTSourceMSSQLConfiguration {
    user: string;
    password: string;
    server: string;
    database: string;
    command: (identifier: string) => string;
    mapping: DGTMap<string, DGTLDField>;
}
