import { DGTErrorConfig, DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';
import { DGTLDNode } from '../../linked-data/models/dgt-ld-node.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTConnectionGravatarConfiguration } from '../models/dgt-connection-gravatar-configuration.model';
import { DGTConnectionMSSQLConfiguration } from '../models/dgt-connection-mssql-configuration.model';
import { DGTConnectionSolidConfiguration } from '../models/dgt-connection-solid-configuration.model';
import { DGTConnectionType } from '../models/dgt-connection-type.model';

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
    public toDomain<T extends DGTConnection<any>>(resources: DGTLDResource[]): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ resources });

        return forkJoin(resources.map(resource => this.toDomainOne<T>(resource)))
            .pipe(
                map(resourcesRes => _.flatten(resourcesRes)),
            );
    }

    /**
     * Transformed a single linked data resource to resources.
     * @param resource The linked data resource to be transformed to resources.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of resources
     */
    private toDomainOne<T extends DGTConnection<any>>(resource: DGTLDResource): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ resource });

        let res: T[] = null;

        if (resource && resource.triples) {
            const resourceSubjectValues = resource.triples.filter(value =>
                value.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
                value.object.value === 'http://digita.ai/voc/connections#connection',
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
    public toTriples<T extends DGTConnection<any>>(resources: T[]): Observable<DGTLDResource[]> {
        this.paramChecker.checkParametersNotNull({ resources });
        this.logger.debug(DGTConnectionTransformerService.name, 'Starting to transform to linked data', { resources });

        const transformedResources = resources.map<DGTLDResource>(resource => {

            const resourceSubject = {
                value: resource.uri,
                termType: DGTLDTermType.REFERENCE,
            } as DGTLDNode;

            let newTriples: DGTLDTriple[] = [
                {
                    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: 'http://digita.ai/voc/connections#connection',
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connections#source',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.source,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connections#holder',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.holder,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connections#state',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: resource.state,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connections#type',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: resource.type,
                    },
                },
            ];

            newTriples = newTriples.concat(this.configToTriples(resource, resourceSubject));

            newTriples = newTriples.filter(triple => triple.object.value !== null && triple.object.value !== undefined);

            return {
                ...resource,
                exchange: resource.exchange,
                uri: resource.uri,
                triples: newTriples,
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
    private transformOne<T extends DGTConnection<any>>(triple: DGTLDTriple, resource: DGTLDResource): T {
        this.paramChecker.checkParametersNotNull({ resourceSubjectValue: triple, resource });

        const resourceTriples = resource.triples.filter(value =>
            value.subject.value === triple.subject.value);

        const holder = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/connections#holder',
        );
        const source = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/connections#source',
        );
        const state = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/connections#state',
        );
        const type = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/connections#type',
        );

        const config = this.configToDomain(triple, resource);

        return {
            uri: triple.subject.value,
            triples: null,
            state: state ? state.object.value : null,
            exchange: resource.exchange,
            holder: holder ? holder.object.value : null,
            source: source ? source.object.value : null,
            type: type ? type.object.value : null,
            configuration: config,
        } as T;
    }

    // isolated this logic for readablility
    private configToTriples<T extends DGTConnection<any>>(resource: T, resourceSubject: DGTLDNode): DGTLDTriple[] {
        let res = [];

        if (resource.type === DGTConnectionType.SOLID) {
            // solid connection
            // local copy of config to have autofill
            const config: DGTConnectionSolidConfiguration = resource.configuration;
            res = [
                {
                    predicate: 'http://digita.ai/voc/connectionsolidconfig#webid',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.webId,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connectionsolidconfig#accesstoken',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: config.accessToken,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connectionsolidconfig#expiresin',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: config.expiresIn,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connectionsolidconfig#idtoken',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: config.idToken,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connectionsolidconfig#state',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: config.state,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connectionsolidconfig#privatekey',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: config.privateKey,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connectionsolidconfig#loginuri',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.loginUri,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connectionsolidconfig#accountid',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.accountId,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connectionsolidconfig#protocol',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: config.protocol,
                    },
                },
            ];
            Object.keys(config.requestHistory).forEach(key => {
                const subject = {
                    value: `${resource.uri.split('#')[0]}#` + uuid(),
                    termType: DGTLDTermType.REFERENCE,
                };
                res.push({
                    predicate: 'http://digita.ai/voc/connectionsolidconfig#requesthistory',
                    subject: resourceSubject,
                    object: subject,
                });
                res.push({
                    predicate: 'http://digita.ai/voc/connectionsolidconfig#mapkey',
                    subject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: key,
                    },
                });
                res.push({
                    predicate: 'http://digita.ai/voc/connectionsolidconfig#mapvalue',
                    subject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: config.requestHistory[key],
                    },
                });
            });

        } else if (resource.type === DGTConnectionType.MSSQL) {
            // MSSQL connection
            res = [{
                predicate: 'http://digita.ai/voc/connectionmssqlconfig#personid',
                subject: resourceSubject,
                object: {
                    termType: DGTLDTermType.LITERAL,
                    dataType: DGTLDDataType.STRING,
                    value: resource.configuration.personId,
                },
            }];

        } else if (resource.type === DGTConnectionType.GRAVATAR) {
            // Gravatar connection
            res = [{
                predicate: 'http://digita.ai/voc/connectiongravatarconfig#email',
                subject: resourceSubject,
                object: {
                    termType: DGTLDTermType.LITERAL,
                    dataType: DGTLDDataType.STRING,
                    value: resource.configuration.email,
                },
            }];
        } else {
            // NOT A KNOWN CONNECTION TYPE
            res = [];
            throw new DGTErrorConfig('Error converting to triples: the connection configuration is not know', { resource });
        }

        return res;
    }
    private configToDomain(triple: DGTLDTriple, resource: DGTLDResource) {

        let config = null;

        const type = resource.triples.find(value =>
            value.subject.value === triple.subject.value &&
            value.predicate === 'http://digita.ai/voc/connections#type',
        );

        if (type && type.object.value === DGTConnectionType.SOLID) {
            // solid connection
            const webId = resource.triples.find(value =>
                value.subject.value === triple.subject.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#webid',
            );
            const accessToken = resource.triples.find(value =>
                value.subject.value === triple.subject.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#accesstoken',
            );
            const expiresIn = resource.triples.find(value =>
                value.subject.value === triple.subject.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#expiresin',
            );
            const idToken = resource.triples.find(value =>
                value.subject.value === triple.subject.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#idtoken',
            );
            const configstate = resource.triples.find(value =>
                value.subject.value === triple.subject.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#state',
            );
            const privateKey = resource.triples.find(value =>
                value.subject.value === triple.subject.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#privatekey',
            );
            const loginUri = resource.triples.find(value =>
                value.subject.value === triple.subject.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#loginuri',
            );
            const accountId = resource.triples.find(value =>
                value.subject.value === triple.subject.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#accountid',
            );
            const protocol = resource.triples.find(value =>
                value.subject.value === triple.subject.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#protocol',
            );
            const requestHistory = resource.triples.filter(value =>
                value.subject.value === triple.subject.value &&
                value.predicate === 'http://digita.ai/voc/connectionsolidconfig#requesthistory',
            );

            const requestHistoryObj = {};
            requestHistory.forEach(req => {
                const requestHistorykey = resource.triples.find(value =>
                    value.subject.value === req.object.value &&
                    value.predicate === 'http://digita.ai/voc/connectionsolidconfig#mapkey',
                );
                const requestHistoryvalue = resource.triples.find(value =>
                    value.subject.value === req.object.value &&
                    value.predicate === 'http://digita.ai/voc/connectionsolidconfig#mapvalue',
                );
                if (requestHistorykey && requestHistoryvalue) {
                    requestHistoryObj[requestHistorykey.object.value] =
                        requestHistoryvalue.object.value;
                } else {
                    this.logger.debug(DGTConnectionTransformerService.name, 'Problem reading in requestHistory', { req });
                }
            });

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
                requestHistory: requestHistoryObj ? requestHistoryObj : null,
            } as DGTConnectionSolidConfiguration;
        } else if (type && type.object.value === DGTConnectionType.MSSQL) {
            const personId = resource.triples.find(value =>
                value.subject.value === triple.subject.value &&
                value.predicate === 'http://digita.ai/voc/connectionmssqlconfig#personid',
            );
            config = {
                personId: personId ? personId.object.value : null,
            } as DGTConnectionMSSQLConfiguration;
        } else if (type && type.object.value === DGTConnectionType.GRAVATAR) {
            const email = resource.triples.find(value =>
                value.subject.value === triple.subject.value &&
                value.predicate === 'http://digita.ai/voc/connectiongravatarconfig#email',
            );

            config = {
                email: email ? email.object.value : null,
            } as DGTConnectionGravatarConfiguration;
        } else {
            // NOT A KNOWN CONNECTION
            throw new DGTErrorConfig('The connection configuration was not recognized', { triple, resource });
        }

        return config;
    }
}
