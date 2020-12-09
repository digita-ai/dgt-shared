import { RouterTestingModule } from '@angular/router/testing';
import { DGTProfileMockService, DGTCacheInMemoryService, DGTCacheService, DGTConnectionMockService, DGTConnectionService, DGTExchangeMockService, DGTExchangeService, DGTLDTypeRegistrationMockService, DGTLDTypeRegistrationService, DGTProfileService, DGTPurposeMockService, DGTPurposeService, DGTSourceMockService, DGTSourceService, DGTUriFactoryService, DGTUriFactorySolidService, DGTDataValueService, DGTDataValueMockService } from '@digita-ai/dgt-shared-data';
import { DGTTestConfiguration } from '@digita-ai/dgt-shared-test';
import { DGTConfigurationService, DGTConfigurationMockService } from '@digita-ai/dgt-shared-utils';
import { declarations, imports, providers } from './lib/dgt-shared-web.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DGTDataInterfaceFactoryService } from './lib/data/services/dgt-data-interface-factory.service';
import { DGTDataInterfaceResolverMockService } from './lib/data/services/dgt-data-interface-resolver-mock.service';
import { DGTDataInterfaceResolverService } from './lib/data/services/dgt-data-interface-resolver.service';
import { DGTDataInterfaceStandardComponent } from './lib/data/components/dgt-data-interface-standard/dgt-data-interface-standard.component';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    declarations: [],
    entryComponents: [
        DGTDataInterfaceStandardComponent,
    ]
})
export class DGTTestEntryComponentsModule { }

export const configuration: DGTTestConfiguration = {
    module: {
        declarations: [
            ...declarations
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
                provide: DGTLDTypeRegistrationService,
                useClass: DGTLDTypeRegistrationMockService
            },
            {
                provide: DGTDataValueService,
                useClass: DGTDataValueMockService
            },
        ],
    }
};
