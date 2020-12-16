import { RouterTestingModule } from '@angular/router/testing';
import { DGTDataService, DGTMockDatabase, DGTMockDataService, DGTQueryService } from '@digita-ai/dgt-shared-data';
import { DGTTestConfiguration } from '@digita-ai/dgt-shared-test';
import { DGTHttpService } from '@digita-ai/dgt-shared-utils';
import { declarations, imports, providers } from './lib/dgt-shared-connectors.module';

export const configuration: DGTTestConfiguration = {
    module: {
        declarations,
        imports: [
            RouterTestingModule,
            ...imports,
        ],
        providers: [
            ...providers,
            {
                provide: DGTMockDatabase,
                useValue: new DGTMockDatabase([]),
            },
            {
                provide: DGTDataService,
                useClass: DGTMockDataService,
            },
            DGTQueryService,
            DGTHttpService,
        ],
    },
};
