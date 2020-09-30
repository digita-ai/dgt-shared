import { DGTSource } from '../models/dgt-source.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DGTErrorArgument, DGTLoggerService, DGTMap } from '@digita/dgt-shared-utils';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { Injectable } from '@angular/core';
import { DGTSourceConnector } from '../models/dgt-source-connector.model';
import { DGTSourceType } from '../models/dgt-source-type.model';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import * as _ from 'lodash';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import { DGTPurpose } from '../../purpose/models/dgt-purpose.model';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTSourceState } from '../models/dgt-source-state.model';

@Injectable()
export abstract class DGTSourceService implements DGTLDResourceService<DGTSource<any>> {

    private connectors: DGTMap<DGTSourceType, DGTSourceConnector<any, any>>;

    constructor(protected logger: DGTLoggerService) { }

    public abstract get(id: string): Observable<DGTSource<any>>;
    public abstract query(filter: Partial<DGTSource<any>>): Observable<DGTSource<any>[]>;
    public abstract save(resource: DGTSource<any>): Observable<DGTSource<any>>;
    public abstract delete(resource: DGTSource<any>): Observable<DGTSource<any>>;

    public abstract linkSource(inviteId: string, sourceId: string): Observable<{ state: string; loginUri: string; }>;

    public getTriples(exchange: DGTExchange, connection: DGTConnection<any>, source: DGTSource<any>, purpose: DGTPurpose)
        : Observable<DGTLDTriple[]> {
        this.logger.debug(DGTSourceService.name, 'Getting source', source);

        if (!source || source.state !== DGTSourceState.PREPARED) {
            throw new DGTErrorArgument('Argument source || source.state === DGTSourceState. should be set.', source);
        }

        let connector: DGTSourceConnector<any, any> = null;

        if (this.connectors) {
            connector = this.connectors.get(source.type);
        }

        return connector.query(null, purpose, exchange, connection, source, null)
            .pipe(
                map((entities) => entities.map(entity => entity.triples)),
                map((triples) => _.flatten(triples)),
                map(triples => triples.filter(triple => purpose.predicates.includes(triple.predicate)))
            );
    }

    public register(sourceType: DGTSourceType, connector: DGTSourceConnector<any, any>) {
        if (!this.connectors) {
            this.connectors = new DGTMap<DGTSourceType, DGTSourceConnector<any, any>>();
        }

        this.connectors.set(sourceType, connector);
    }

    /**
   * Returns a list of sources matching query
   * @param query string to match
   * @param sources sources to filter
   */
    public filterSources(query: string, sources: DGTSource<any>[]): DGTSource<any>[] {
        return sources.filter((source: DGTSource<any>) => {
            const issuer: string = source.configuration.issuer.toLowerCase();
            const desc: string = source.description.toLowerCase();
            return issuer.includes(query)
                || desc.includes(query)
                || query.includes(issuer.split('//')[1]);
            // "https://dirk.solid.community/profile/card#me"
            // should not show an external source because solid.community is known
        });
    }

    /**
     * Checks if a given uri has a solid server running
     * @param query uri to check
     */
    public isExternalSource(query: string): Observable<{ success: boolean, uri: string }> {
        const uri = this.parseUri(query);
        throw new DGTErrorArgument('not implemented', 'isExternalSource');
    }

    /**
     * Parses a uri
     */
    public parseUri(uri: string): string {
        // Add http prefix if necessary
        if (!/^https?:\/\//.test(uri)) {
            uri = 'https://'.concat(uri);
        }
        try {
            return new URL(uri).origin;
        } catch (err) {
            this.logger.debug(DGTSourceService.name, 'URL is not valid', uri);
            return null;
        }
    }
}
