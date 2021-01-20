import { NgModule } from '@angular/core';
import { DGTSharedUtilsModule } from '@digita-ai/dgt-shared-utils';
import { DGTCacheInMemoryService } from './cache/services/dgt-cache-in-memory.service';
import { DGTCacheSolidService } from './cache/services/dgt-cache-solid.service';
import { DGTCategoryCacheService } from './categories/services/dgt-category-cache.service';
import { DGTCategoryTransformerService } from './categories/services/dgt-category-transformer.service';
import { DGTConnectionTransformerService } from './connection/services/dgt-connection-transformer.service';
import { DGTConnectorService } from './connector/services/dgt-connector.service';
import { DGTSecurityCredentialMockService } from './credential/services/dgt-security-credential-mock.service';
import { DGTSecurityCredentialTransformerService } from './credential/services/dgt-security-credential-transformer.service';
import { DGTDataInterfaceHostDirective } from './data-resource/directives/data-interface-host.directive';
import { DGTEventTransformerService } from './events/services/dgt-event-transformer.service';
import { DGTExchangeTransformerService } from './exchanges/services/dgt-exchange-transformer.service';
import { DGTHolderTransformerService } from './holder/services/dgt-holder-transformer.service';
import { DGTInviteTransformerService } from './invite/services/dgt-invite-transformer.service';
import { DGTLDFilterRunnerBGPService } from './linked-data/services/dgt-ld-filter-runner-bgp.service';
import { DGTLDFilterService } from './linked-data/services/dgt-ld-filter.service';
import { DGTLDRepresentationSparqlDeleteFactory } from './linked-data/services/dgt-ld-representation-sparql-delete-factory';
import { DGTLDRepresentationSparqlInsertFactory } from './linked-data/services/dgt-ld-representation-sparql-insert-factory';
import { DGTLDResourceTransformerService } from './linked-data/services/dgt-ld-resource-transformer.service';
import { DGTLDTripleFactoryService } from './linked-data/services/dgt-ld-triple-factory.service';
import { DGTLDTypeRegistrationTransformerService } from './linked-data/services/dgt-ld-type-registration-transformer.service';
import { DGTLDUtils } from './linked-data/services/dgt-ld-utils.service';
import { DGTLDService } from './linked-data/services/dgt-ld.service';
import { DGTQueryService } from './metadata/services/dgt-query.service';
import { DGTSecurityPolicyMockService } from './policy/services/dgt-security-policy-mock.service';
import { DGTSecurityPolicyTransformerService } from './policy/services/dgt-security-policy-transformer.service';
import { DGTProfileTransformerService } from './profile/services/dgt-profile-transformer.service';
import { DGTPurposeTransformerService } from './purpose/services/dgt-purpose-transformer.service';
import { DGTSourceTransformerService } from './source/services/dgt-source-transformer.service';
import { DGTSparqlCommunicaService } from './sparql/services/dgt-sparql-communica.service';
import { DGTSparqlQueryService } from './sparql/services/dgt-sparql-query.service';
import { DGTUriFactoryCacheService } from './uri/services/dgt-uri-factory-cache.service';
import { DGTUriFactorySolidService } from './uri/services/dgt-uri-factory-solid.service';
import { DGTWorkflowCacheService } from './workflow/services/dgt-workflow-cache.service';
import { DGTWorkflowMockService } from './workflow/services/dgt-workflow-mock.service';
import { DGTWorkflowTransformerService } from './workflow/services/dgt-workflow-transformer.service';

export const declarations = [
  DGTDataInterfaceHostDirective,
];
export const imports = [
  DGTSharedUtilsModule,
];
export const providers = [
  DGTLDUtils,
  DGTLDService,
  DGTLDFilterService,
  DGTLDFilterRunnerBGPService,
  DGTQueryService,
  DGTCacheInMemoryService,
  DGTCacheSolidService,
  DGTWorkflowTransformerService,
  DGTWorkflowCacheService,
  DGTWorkflowMockService,
  DGTLDTripleFactoryService,
  DGTLDTypeRegistrationTransformerService,
  DGTProfileTransformerService,
  DGTEventTransformerService,
  DGTConnectorService,
  DGTSparqlQueryService,
  DGTConnectionTransformerService,
  DGTExchangeTransformerService,
  DGTHolderTransformerService,
  DGTInviteTransformerService,
  DGTPurposeTransformerService,
  DGTSourceTransformerService,
  DGTUriFactoryCacheService,
  DGTUriFactorySolidService,
  DGTSecurityCredentialMockService,
  DGTSecurityCredentialTransformerService,
  DGTSecurityPolicyMockService,
  DGTSecurityPolicyTransformerService,
  DGTCategoryCacheService,
  DGTCategoryTransformerService,
  DGTLDRepresentationSparqlInsertFactory,
  DGTLDRepresentationSparqlDeleteFactory,
  DGTLDResourceTransformerService,
  DGTSparqlCommunicaService,
  DGTLDTypeRegistrationTransformerService,
];

@NgModule({
  declarations,
  providers,
  imports,
  exports: [
    DGTDataInterfaceHostDirective,
  ],
})
export class DGTSharedDataModule { }
