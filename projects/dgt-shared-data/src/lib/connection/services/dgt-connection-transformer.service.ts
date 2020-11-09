import { Observable, of, forkJoin } from 'rxjs';
import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService, DGTErrorConfig } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTConnectionSolidConfiguration } from '../models/dgt-connection-solid-configuration.model';
import { DGTConnectionGravatarConfiguration } from '../models/dgt-connection-gravatar-configuration.model';
import { DGTConnectionMSSQLConfiguration } from '../models/dgt-connection-mssql-configuration.model';

/** Transforms linked data to resources, and the other way around. */
@DGTInjectable()
export class DGTConnectionTransformerService implements DGTLDTransformer<DGTConnection<any>> {

    constructor(
        private logger: DGTLoggerService,
        private paramChecker: DGTParameterCheckerService,
    ) { }

    /**
     * Transforms multiple linked data resources to resources.
     * @param resources Linked data objects to be transformed to resources
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of resources
     */
    public toDomain(resources: DGTLDResource[]): Observable<DGTConnection<any>[]> {
        this.paramChecker.checkParametersNotNull({ resources });

        return forkJoin(resources.map(resource => this.toDomainOne(resource)))
            .pipe(
                map(resourcesRes => _.flatten(resourcesRes))
            );
    }

    /**
     * Transformed a single linked data resource to resources.
     * @param resource The linked data resource to be transformed to resources.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of resources
     */
    private toDomainOne(resource: DGTLDResource): Observable<DGTConnection<any>[]> {
        this.paramChecker.checkParametersNotNull({ resource });

        let res: DGTConnection<any>[] = null;

        if (resource && resource.triples) {
            const resourceSubjectValues = resource.triples.filter(value =>
                value.predicate === 'http://digita.ai/voc/connections#connection'
            );

            if (resourceSubjectValues) {
                res = resourceSubjectValues.map(resourceSubjectValue => this.transformOne(resourceSubjectValue, resource));
            }
        }

        this.logger.debug(DGTConnectionTransformerService.name, 'Transformed values to resources', { resource, res });

        return of(res);
    }

    /**
     * Converts resources to linked data.
     * @param resources The resources which will be transformed to linked data.
     * @param connection The connection on which the resources are stored.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of linked data resources.
     */
    public toTriples(resources: DGTConnection<any>[]): Observable<DGTLDResource[]> {
        this.paramChecker.checkParametersNotNull({ resources });
        this.logger.debug(DGTConnectionTransformerService.name, 'Starting to transform to linked data', { resources });

        const transformedResources = resources.map<DGTLDResource>(resource => {
            const documentSubject = {
                value: '#',
                termType: DGTLDTermType.REFERENCE
            };

            const resourceSubject = {
                value: resource.uri,
                termType: DGTLDTermType.REFERENCE
            };

            let newTriples: DGTLDTriple[] = [
                {
                    predicate: 'http://digita.ai/voc/connections#source',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.source
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connections#exchange',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.exchange
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connections#holder',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.holder
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connections#state',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.state
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connections#connection',
                    subject: documentSubject,
                    object: resourceSubject,
                }
            ];

            // this IF method is not the way to go, it will work for now tho
            if (resource.configuration.webId) {
                // solid connection
                // local copy of config to have autofill
                const config: DGTConnectionSolidConfiguration = resource.configuration;
                newTriples = newTriples.concat([
                    {
                        predicate: 'http://digita.ai/voc/connectionsolidconfig#webid',
                        subject: resourceSubject,
                        object: {
                            termType: DGTLDTermType.REFERENCE,
                            dataType: DGTLDDataType.STRING,
                            value: config.webId
                        },
                    },
                    {
                        predicate: 'http://digita.ai/voc/connectionsolidconfig#accesstoken',
                        subject: resourceSubject,
                        object: {
                            termType: DGTLDTermType.REFERENCE,
                            dataType: DGTLDDataType.STRING,
                            value: config.accessToken
                        },
                    },
                    {
                        predicate: 'http://digita.ai/voc/connectionsolidconfig#expiresin',
                        subject: resourceSubject,
                        object: {
                            termType: DGTLDTermType.REFERENCE,
                            dataType: DGTLDDataType.STRING,
                            value: config.expiresIn
                        },
                    },
                    {
                        predicate: 'http://digita.ai/voc/connectionsolidconfig#idtoken',
                        subject: resourceSubject,
                        object: {
                            termType: DGTLDTermType.REFERENCE,
                            dataType: DGTLDDataType.STRING,
                            value: config.idToken
                        },
                    },
                    {
                        predicate: 'http://digita.ai/voc/connectionsolidconfig#state',
                        subject: resourceSubject,
                        object: {
                            termType: DGTLDTermType.REFERENCE,
                            dataType: DGTLDDataType.STRING,
                            value: config.state
                        },
                    },
                    {
                        predicate: 'http://digita.ai/voc/connectionsolidconfig#privatekey',
                        subject: resourceSubject,
                        object: {
                            termType: DGTLDTermType.REFERENCE,
                            dataType: DGTLDDataType.STRING,
                            value: config.privateKey
                        },
                    },
                    {
                        predicate: 'http://digita.ai/voc/connectionsolidconfig#loginuri',
                        subject: resourceSubject,
                        object: {
                            termType: DGTLDTermType.REFERENCE,
                            dataType: DGTLDDataType.STRING,
                            value: config.loginUri
                        },
                    },
                    {
                        predicate: 'http://digita.ai/voc/connectionsolidconfig#accountid',
                        subject: resourceSubject,
                        object: {
                            termType: DGTLDTermType.REFERENCE,
                            dataType: DGTLDDataType.STRING,
                            value: config.accountId
                        },
                    },
                    {
                        predicate: 'http://digita.ai/voc/connectionsolidconfig#protocol',
                        subject: resourceSubject,
                        object: {
                            termType: DGTLDTermType.REFERENCE,
                            dataType: DGTLDDataType.STRING,
                            value: config.protocol
                        },
                    },
                ]);

            } else if (resource.configuration.personId) {
                // MSSQL connection
                newTriples.push({
                    predicate: 'http://digita.ai/voc/connectionmssqlconfig#personid',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.configuration.personId
                    },
                });

            } else if (resource.configuration.email) {
                // Gravatar connection
                newTriples.push({
                    predicate: 'http://digita.ai/voc/connectiongravatarconfig#email',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.configuration.email
                    },
                });
            } else {
                // NOT A KNOWN CONNECTION TYPE
                throw new DGTErrorConfig('Error converting to triples: the connection configuration is not know', { resource });
            }

            return {
                ...resource,
                exchange: resource.exchange,
                uri: resource.uri,
                triples: newTriples
            };
        });

        this.logger.debug(DGTConnectionTransformerService.name, 'Transformed resources to linked data', transformedResources);

        return of(transformedResources);
    }

    /**
     * Creates a single resource from linked data.
     * @param triple The resource of the the resource's subject.
     * @param resource\ The resource to be transformed to an resource.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns The transformed resource.
     */
    private transformOne(triple: DGTLDTriple, resource: DGTLDResource): DGTConnection<any> {
        this.paramChecker.checkParametersNotNull({ resourceSubjectValue: triple, resource });

        const exchange = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/connections#exchange'
        );
        const holder = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/connections#holder'
        );
        const source = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/connections#source'
        );
        const state = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/connections#state'
        );

        const config = this.configToDomain(triple, resource);

        return {
            uri: resource.uri,
            triples: [triple],
            state: state ? state.object.value : null,
            exchange: exchange ? exchange.object.value : null,
            holder: holder ? holder.object.value : null,
            source: source ? source.object.value : null,
            configuration: config,
        };
    }

    // isolated this logic for readablility
    private configToDomain(triple: DGTLDTriple, resource: DGTLDResource) {

        let config = null;

        // Determine connection type, this is temporary and not very reusable
        const webId = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/connectionsolidconfig#webid'
        );

        if (webId) {
            // solid connection
            const accessToken = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#accesstoken'
            );
            const expiresIn = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#expiresin'
            );
            const idToken = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#idtoken'
            );
            const configstate = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#state'
            );
            const privateKey = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#privatekey'
            );
            const loginUri = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#loginuri'
            );
            const accountId = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#accountid'
            );
            const protocol = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#protocol'
            );

            config = {
                webId: webId ? webId.object.value : null,
                accessToken: accessToken ? accessToken.object.value : null,
                expiresIn: expiresIn ? expiresIn.object.value : null,
                idToken: idToken ? idToken.object.value : null,
                state: configstate ? configstate.object.value : null,
                privateKey: privateKey ? privateKey.object.value : null,
                loginUri: loginUri ? loginUri.object.value : null,
                accountId: accountId ? accountId.object.value : null,
                protocol: protocol ? protocol.object.value : null,
            } as DGTConnectionSolidConfiguration;
        } else {
            const personId = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/connectionmssqlconfig#personid'
            );

            if (personId) {
                // MSSQL connection
                config = {
                    personId: personId ? personId.object.value : null,
                } as DGTConnectionMSSQLConfiguration;
            } else {
                const email = resource.triples.find(value =>
                    value.subject.value === triple.object.value &&
                    value.predicate === 'http://digita.ai/voc/connectiongravatarconfig#email'
                );

                if (email) {
                    // gravatar connection
                    config = {
                        email: email ? email.object.value : null,
                    } as DGTConnectionGravatarConfiguration;
                } else {
                    // NOT A KNOWN CONNECTION
                    throw new DGTErrorConfig('The connection configuration was not recognized', {triple, resource});
                }
            }
        }

        return config;
    }
}
