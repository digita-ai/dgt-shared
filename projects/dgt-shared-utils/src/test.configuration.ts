import { RouterTestingModule } from '@angular/router/testing';
import { DGTTestConfiguration } from '@digita-ai/dgt-shared-test';
import { DGTConfigurationMockService } from './lib/configuration/services/dgt-configuration-mock.service';
import { DGTConfigurationService } from './lib/configuration/services/dgt-configuration.service';
import { declarations, imports, providers } from './lib/dgt-shared-utils.module';

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
                provide: DGTConfigurationService,
                useClass: DGTConfigurationMockService,
            }
        ],
    },
};
