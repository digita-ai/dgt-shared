import { DGTErrorArgument, DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { forkJoin, of } from 'rxjs';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { v4 } from 'uuid';
import { DGTConnectionSolidConfiguration } from '../../connection/models/dgt-connection-solid-configuration.model';
import { DGTConnectionType } from '../../connection/models/dgt-connection-type.model';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTUriFactoryService } from './dgt-uri-factory.service';
/**
 * Service that generates URIs for resources from a solid pod
 * e.g. https://sanderclaes.inrupt.net/foo/bar
 * Pass resourceType to constructor ('holder', 'connection', 'exchange', ...)
 */
@DGTInjectable()
export class DGTUriFactorySolidService implements DGTUriFactoryService {
    constructor(private exchanges: DGTExchangeService, private connections: DGTConnectionService) {}

    /**
     * Generates a URI for a resource
     * @param resource The DGTLDResource to generate a uri for
     */
    public generate(resources: DGTLDResource[], prefix: string): Observable<DGTLDResource[]> {
        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        return of({ resources, prefix }).pipe(
            switchMap((data) =>
                forkJoin(
                    data.resources.map((resource) =>
                        resource.uri ? of(resource) : this.generateOne(resource, data.prefix),
                    ),
                ),
            ),
        );
    }

    private generateOne(resource: DGTLDResource, prefix: string): Observable<DGTLDResource> {
        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        return of({ resource, prefix }).pipe(
            switchMap((data) =>
                this.exchanges.get(data.resource.exchange).pipe(map((exchange) => ({ ...data, exchange }))),
            ),
            switchMap((data) =>
                this.connections.get(data.exchange.connection).pipe(
                    map((connection) => ({
                        ...data,
                        connection:
                            connection && connection.type === DGTConnectionType.SOLID && connection.configuration
                                ? connection
                                : null,
                    })),
                ),
            ),
            map((data) => ({
                ...data,
                typeRegistration: (data.connection
                    .configuration as DGTConnectionSolidConfiguration).typeRegistrations?.find(
                    (typeRegistration) => typeRegistration.forClass === data.resource.shape,
                ),
            })),
            map((data) => ({
                ...data.resource,
                uri: data.typeRegistration ? `${data.typeRegistration.instance}#${v4()}` : null,
            })),
        );
    }
}
