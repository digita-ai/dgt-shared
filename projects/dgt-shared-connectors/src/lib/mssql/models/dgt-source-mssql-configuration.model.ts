import { DGTMap } from '@digita-ai/dgt-shared-utils';

export interface DGTSourceMSSQLConfiguration {
    user: string;
    password: string;
    server: string;
    database: string;
    commands: {
        [key: string]: Function,
    };
    mapping: DGTMap<string, string>;
}
