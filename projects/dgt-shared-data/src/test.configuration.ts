import { RouterTestingModule } from '@angular/router/testing';
import { DGTTestConfiguration } from '@digita-ai/dgt-shared-test';
import { DGTConfigurationMockService, DGTConfigurationService } from '@digita-ai/dgt-shared-utils';
import { DGTCacheInMemoryService } from './lib/cache/services/dgt-cache-in-memory.service';
import { DGTCacheService } from './lib/cache/services/dgt-cache.service';
import { DGTConnectionService } from './lib/connection/services/dgt-connection-abstract.service';
import { DGTConnectionMockService } from './lib/connection/services/dgt-connection-mock.service';
import { declarations, imports, providers } from './lib/dgt-shared-data.module';
import { DGTExchangeMockService } from './lib/exchanges/services/dgt-exchange-mock.service';
import { DGTExchangeService } from './lib/exchanges/services/dgt-exchange.service';
import { DGTProfileMockService } from './lib/profile/services/dgt-profile-mock.service';
import { DGTProfileService } from './lib/profile/services/dgt-profile.service';
import { DGTPurposeMockService } from './lib/purpose/services/dgt-purpose-mock.service';
import { DGTPurposeService } from './lib/purpose/services/dgt-purpose.service';
import { DGTSourceMockService } from './lib/source/services/dgt-source-mock.service';
import { DGTSourceService } from './lib/source/services/dgt-source.service';
import { DGTUriFactorySolidService } from './lib/uri/services/dgt-uri-factory-solid.service';
import { DGTUriFactoryService } from './lib/uri/services/dgt-uri-factory.service';

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
        ],
    },
};
