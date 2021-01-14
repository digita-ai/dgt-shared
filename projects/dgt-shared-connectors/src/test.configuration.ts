import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DGTCacheInMemoryService, DGTCacheService, DGTConnectionMockService, DGTConnectionService, DGTDataValueMockService, DGTDataValueService, DGTExchangeMockService, DGTExchangeService, DGTLDTypeRegistrationTransformerService, DGTProfileMockService, DGTProfileService, DGTPurposeMockService, DGTPurposeService, DGTSourceMockService, DGTSourceService, DGTUriFactoryService, DGTUriFactorySolidService } from '@digita-ai/dgt-shared-data';
import { DGTTestConfiguration } from '@digita-ai/dgt-shared-test';
import { DGTConfigurationMockService, DGTConfigurationService, DGTCryptoBrowserService, DGTCryptoService } from '@digita-ai/dgt-shared-utils';
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
            DGTLDTypeRegistrationTransformerService,
        ],
    },
};
