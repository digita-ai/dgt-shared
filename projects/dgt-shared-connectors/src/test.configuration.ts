import { RouterTestingModule } from '@angular/router/testing';
import { DGTTestConfiguration } from '@digita-ai/dgt-shared-test';
import { declarations, imports, providers } from './lib/dgt-shared-connectors.module';
import { DGTMockDatabase, DGTDataService, DGTMockDataService, DGTQueryService } from '@digita-ai/dgt-shared-data';
import { DGTHttpService } from '@digita-ai/dgt-shared-utils';

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
                useValue: new DGTMockDatabase([])
            },
            {
                provide: DGTDataService,
                useClass: DGTMockDataService
            },
            DGTQueryService,
            DGTHttpService
        ],
    }
};
