import { DGTMap } from '@digita/dgt-shared-utils';

export interface DGTSourceMSSQLConfiguration {
    user: string;
    password: string;
    server: string;
    database: string;
    command: (identifier: string) => string;
    mapping: DGTMap<string, string>;
}
