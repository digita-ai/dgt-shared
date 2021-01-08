import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DGTCacheInMemoryService, DGTCacheService, DGTConnectionMockService, DGTConnectionService, DGTDataValueMockService, DGTDataValueService, DGTExchangeMockService, DGTExchangeService, DGTProfileMockService, DGTProfileService, DGTPurposeMockService, DGTPurposeService, DGTSourceMockService, DGTSourceService, DGTUriFactoryService, DGTUriFactorySolidService } from '@digita-ai/dgt-shared-data';
import { DGTTestConfiguration } from '@digita-ai/dgt-shared-test';
import { DGTConfigurationMockService, DGTConfigurationService } from '@digita-ai/dgt-shared-utils';
import { DGTDataInterfaceStandardComponent } from './lib/data/components/dgt-data-interface-standard/dgt-data-interface-standard.component';
import { DGTDataInterfaceFactoryService } from './lib/data/services/dgt-data-interface-factory.service';
import { DGTDataInterfaceResolverMockService } from './lib/data/services/dgt-data-interface-resolver-mock.service';
import { DGTDataInterfaceResolverService } from './lib/data/services/dgt-data-interface-resolver.service';
import { declarations, imports, providers } from './lib/dgt-shared-web.module';

@NgModule({
    declarations: [],
    entryComponents: [
        DGTDataInterfaceStandardComponent,
    ],
})
export class DGTTestEntryComponentsModule { }

export const configuration: DGTTestConfiguration = {
    module: {
        declarations: [
            ...declarations,
        ],
        imports: [
            RouterTestingModule,
            NoopAnimationsModule,
            HttpClientModule,
            DGTTestEntryComponentsModule,
            ...imports,
        ],
        providers: [
            ...providers,
            DGTDataInterfaceFactoryService,
            {
                provide: DGTDataInterfaceResolverService,
                useClass: DGTDataInterfaceResolverMockService,
            },
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
        ],
    },
};
