import { DGTMap } from '@digita-ai/dgt-shared-utils';

export interface DGTSourceMSSQLConfiguration {
    user: string;
    password: string;
    server: string;
    database: string;
    commands: {
        select: string,
        delete: string,
        insert: string,
        update: string,
    };
    mapping: {[key: string]: string};
}
