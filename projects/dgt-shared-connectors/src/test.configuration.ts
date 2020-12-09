import { RouterTestingModule } from '@angular/router/testing';
import { DGTProfileMockService, DGTCacheInMemoryService, DGTCacheService, DGTConnectionMockService, DGTConnectionService, DGTExchangeMockService, DGTExchangeService, DGTLDTypeRegistrationMockService, DGTLDTypeRegistrationService, DGTProfileService, DGTPurposeMockService, DGTPurposeService, DGTSourceMockService, DGTSourceService, DGTUriFactoryService, DGTUriFactorySolidService, DGTDataValueService, DGTDataValueMockService } from '@digita-ai/dgt-shared-data';
import { DGTTestConfiguration } from '@digita-ai/dgt-shared-test';
import { DGTConfigurationService, DGTConfigurationMockService, DGTCryptoBrowserService, DGTCryptoService } from '@digita-ai/dgt-shared-utils';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { declarations, imports, providers } from './lib/dgt-shared-connectors.module';
import { HttpClientModule } from '@angular/common/http';

export const configuration: DGTTestConfiguration = {
    module: {
        declarations: [
            ...declarations
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
                provide: DGTLDTypeRegistrationService,
                useClass: DGTLDTypeRegistrationMockService
            },
            {
                provide: DGTDataValueService,
                useClass: DGTDataValueMockService
            },
            {
                provide: DGTCryptoService,
                useClass: DGTCryptoBrowserService
            },
        ],
    }
};
