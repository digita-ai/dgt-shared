import { RouterTestingModule } from '@angular/router/testing';
import { DGTTestConfiguration } from '@digita/dgt-shared-test';
import { declarations, imports, providers } from './lib/dgt-shared-connectors.module';

export const configuration: DGTTestConfiguration = {
    module: {
        declarations,
        imports: [
            RouterTestingModule,
            ...imports,
        ],
        providers: [
            ...providers
        ],
    }
};
