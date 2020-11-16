import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { DGTSecurityCredential } from '../models/dgt-security-credential.model';
import { DGTSecurityCredentialService } from './dgt-security-credential.service';
import * as _ from 'lodash';
import { DGTLoggerService, DGTErrorArgument } from '@digita-ai/dgt-shared-utils';
import { switchMap } from 'rxjs/operators';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';

@Injectable()
export class DGTSecurityCredentialMockService extends DGTSecurityCredentialService {
    private resources: DGTSecurityCredential[] = [];

    constructor(private logger: DGTLoggerService, private filters: DGTLDFilterService) {
        super();
    }

    public get(uri: string): Observable<DGTSecurityCredential> {
        return of(this.resources.find(e => e.uri === uri));
    }

    public query<T extends DGTSecurityCredential>(filter?: DGTLDFilter): Observable<T[]> {
        this.logger.debug(DGTSecurityCredentialMockService.name, 'Starting to query users', filter);

        return of({ filter, resources: this.resources as T[] })
            .pipe(
                switchMap(data => data.filter ? this.filters.run<T>(data.filter, data.resources) : of(data.resources)),
            );
    }

    public save(resource: DGTSecurityCredential): Observable<DGTSecurityCredential> {
        this.logger.debug(DGTSecurityCredentialMockService.name, 'Starting to save resource', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument connection should be set.', resource);
        }

        if (!resource.uri) {
            this.resources = [...this.resources, resource];
        } else {
            this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri), resource];
        }

        return of(resource);
    }

    public delete(resource: DGTSecurityCredential): Observable<DGTSecurityCredential> {
        this.logger.debug(DGTSecurityCredentialMockService.name, 'Starting to delete resource', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri)];

        return of(resource);
    }
}
