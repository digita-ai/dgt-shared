import { RouterTestingModule } from '@angular/router/testing';
import { DGTDataService, DGTMockDatabase, DGTMockDataService, DGTQueryService } from '@digita-ai/dgt-shared-data';
import { DGTTestConfiguration } from '@digita-ai/dgt-shared-test';
import { DGTHttpService } from '@digita-ai/dgt-shared-utils';
import { declarations, imports, providers } from './lib/dgt-shared-connectors.module';

export const configuration: DGTTestConfiguration = {
    module: {
        declarations: [
            ...declarations,
        ],
        imports: [
            RouterTestingModule,
            NoopAnimationsModule,
            HttpClientModule,
            ...imports,
        ],
        providers: [
            ...providers,
            {
                provide: DGTCacheService,
                useClass: DGTCacheInMemoryService,
            },
            {
                provide: DGTExchangeService,
                useClass: DGTExchangeMockService,
            },
            {
                provide: DGTConfigurationService,
                useClass: DGTConfigurationMockService,
            },
            {
                provide: DGTSourceService,
                useClass: DGTSourceMockService,
            },
            {
                provide: DGTUriFactoryService,
                useClass: DGTUriFactorySolidService,
            },
            {
                provide: DGTConnectionService,
                useClass: DGTConnectionMockService,
            },
            {
                provide: DGTPurposeService,
                useClass: DGTPurposeMockService,
            },
            {
                provide: DGTProfileService,
                useClass: DGTProfileMockService,
            },
            {
                provide: DGTDataValueService,
                useClass: DGTDataValueMockService,
            },
            {
                provide: DGTCryptoService,
                useClass: DGTCryptoBrowserService,
            },
        ],
    },
};
