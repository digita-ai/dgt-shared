import { RouterTestingModule } from '@angular/router/testing';
import { DGTTestConfiguration } from '@digita-ai/dgt-shared-test';
import { declarations, imports, providers } from './lib/dgt-shared-data.module';
import { DGTDataService } from './lib/metadata/services/dgt-data.service';
import { DGTMockDataService } from './lib/metadata/services/dgt-mock-data.service';
import { DGTMockDatabase } from './lib/metadata/models/dgt-mock-database.model';

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
                useValue: new DGTMockDatabase([
                ])
            },
            {
                provide: DGTDataService,
                useClass: DGTMockDataService
            }
        ],
    }
};
