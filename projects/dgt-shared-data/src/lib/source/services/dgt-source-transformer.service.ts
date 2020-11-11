import { Observable, of, forkJoin } from 'rxjs';
import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService, DGTErrorConfig } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';
import { DGTSource } from '../models/dgt-source.model';
import { DGTSourceType } from '../models/dgt-source-type.model';
import { DGTSourceGravatarConfiguration } from '../models/dgt-source-gravatar-configuration.model';
import { DGTSourceMSSQLConfiguration } from '../models/dgt-source-mssql-configuration.model';
import { DGTSourceSolidConfiguration } from '../models/dgt-source-solid-configuration.model';
import uuid from 'uuid';

/** Transforms linked data to resources, and the other way around. */
@DGTInjectable()
export class DGTSourceTransformerService implements DGTLDTransformer<DGTSource<any>> {

    constructor(
        private logger: DGTLoggerService,
        private paramChecker: DGTParameterCheckerService
    ) { }

    /**
     * Transforms multiple linked data resources to resources.
     * @param resources Linked data objects to be transformed to resources
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of resources
     */
    public toDomain(resources: DGTLDResource[]): Observable<DGTSource<any>[]> {
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
    private toDomainOne(resource: DGTLDResource): Observable<DGTSource<any>[]> {
        this.paramChecker.checkParametersNotNull({ resource });

        let res: DGTSource<any>[] = null;

        if (resource && resource.triples) {
            const resourceSubjectValues = resource.triples.filter(value =>
                value.predicate === 'http://digita.ai/voc/sources#source'
            );

            if (resourceSubjectValues) {
                res = resourceSubjectValues.map(resourceSubjectValue => this.transformOne(resourceSubjectValue, resource));
            }
        }

        this.logger.debug(DGTSourceTransformerService.name, 'Transformed values to resources', { resource, res });

        return of(res);
    }

    /**
     * Converts resources to linked data.
     * @param resources The resources which will be transformed to linked data.
     * @param connection The connection on which the resources are stored.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of linked data resources.
     */
    public toTriples(resources: DGTSource<any>[]): Observable<DGTLDResource[]> {
        this.paramChecker.checkParametersNotNull({ resources });
        this.logger.debug(DGTSourceTransformerService.name, 'Starting to transform to linked data', { resources });

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
                    predicate: 'http://digita.ai/voc/sources#source',
                    subject: documentSubject,
                    object: resourceSubject,
                },
                {
                    predicate: 'http://digita.ai/voc/sources#icon',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.icon
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sources#description',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.description
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sources#type',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.type
                    },
                },
            ];

            if (resource.state) {
                newTriples.push({
                    predicate: 'http://digita.ai/voc/sources#state',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.state
                    },
                });
            }

            newTriples.push(...this.configToTriples(resource, resourceSubject));

            return {
                ...resource,
                exchange: resource.exchange,
                uri: resource.uri,
                triples: newTriples
            };
        });

        this.logger.debug(DGTSourceTransformerService.name, 'Transformed resources to linked data', transformedResources);

        return of(transformedResources);
    }

    /**
     * Creates a single resource from linked data.
     * @param triple The resource of the the resource's subject.
     * @param resource\ The resource to be transformed to an resource.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns The transformed resource.
     */
    private transformOne(triple: DGTLDTriple, resource: DGTLDResource): DGTSource<any> {
        this.paramChecker.checkParametersNotNull({ resourceSubjectValue: triple, resource });

        const icon = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/sources#icon'
        );
        const description = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/sources#description'
        );
        const type = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/sources#type'
        );
        const state = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/sources#state'
        );
        const configuration = this.configToDomain(triple, resource, type.object.value);

        return {
            uri: resource.uri,
            triples: [...resource.triples],
            exchange: resource.exchange,
            icon: icon ? icon.object.value : null,
            description: description ? description.object.value : null,
            type: type ? type.object.value : null,
            state: state ? state.object.value : null,
            configuration: configuration ? configuration : null,
        };
    }

    private configToTriples(resource: DGTSource<any>, resourceSubject): DGTLDTriple[] {
        let res = [];

        if (resource.type === DGTSourceType.SOLID) {
            const config: DGTSourceSolidConfiguration = resource.configuration;
            res = [
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#issuer',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.issuer,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#authorizationendpoint',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.authorization_endpoint,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#tokenendpoint',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.token_endpoint,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#userinfoendpoint',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.userinfo_endpoint,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#jwksuri',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.jwks_uri,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#registrationendpoint',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.registration_endpoint,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#claimsparametersupported',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.claims_parameter_supported,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#requestparametersupported',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.request_parameter_supported,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#requesturiparametersupported',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.request_uri_parameter_supported,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#requirerequesturiregistration',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.require_request_uri_registration,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#checksessioniframe',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.check_session_iframe,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#endsessionendpoint',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.end_session_endpoint,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#callbackuri',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.callbackUri,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#clientid',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.client_id,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#clientsecret',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.client_secret,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#applicationtype',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.application_type,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#clientname',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.client_name,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#logouri',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.logo_uri,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#clienturi',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.client_uri,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#idtokensignedresponsealg',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.id_token_signed_response_alg,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#tokenendpointauthmethod',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.token_endpoint_auth_method,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#defaultmaxage',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.default_max_age,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#frontchannellogoutsessionrequired',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.frontchannel_logout_session_required,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#registrationaccesstoken',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.registration_access_token,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#registrationclienturi',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.registration_client_uri,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#clientidissuedat',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.client_id_issued_at,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#clientsecretexpiresat',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.client_secret_expires_at,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#tokenendpointauthmethodssupported',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.token_endpoint_auth_methods_supported,
                    },
                }
            ];
            config.response_types_supported?.forEach(str => {
                res.push({
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#responsetypessupported',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: str,
                    },
                });
            });
            config.response_modes_supported?.forEach(str => {
                res.push({
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#responsemodessupported',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: str,
                    },
                });
            });
            config.grant_types_supported?.forEach(str => {
                res.push({
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#granttypessupported',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: str,
                    },
                });
            });
            config.subject_types_supported?.forEach(str => {
                res.push({
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#subjecttypessupported',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: str,
                    },
                });
            });
            config.id_token_signing_alg_values_supported?.forEach(str => {
                res.push({
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#idtokensigningalgvaluessupported',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: str,
                    },
                });
            });
            config.token_endpoint_auth_signing_alg_values_supported?.forEach(str => {
                res.push({
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#tokenendpointauthsigningalgvaluessupported',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: str,
                    },
                });
            });
            config.display_values_supported?.forEach(str => {
                res.push({
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#displayvaluessupported',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: str,
                    },
                });
            });
            config.claim_types_supported?.forEach(str => {
                res.push({
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#claimtypessupported',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: str,
                    },
                });
            });
            config.claims_supported?.forEach(str => {
                res.push({
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#claimssupported',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: str,
                    },
                });
            });
            config.redirect_uris?.forEach(str => {
                res.push({
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#redirecturis',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: str,
                    },
                });
            });
            config.response_types?.forEach(str => {
                res.push({
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#responsetypes',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: str,
                    },
                });
            });
            config.grant_types?.forEach(str => {
                res.push({
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#granttypes',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: str,
                    },
                });
            });
            config.post_logout_redirect_uris?.forEach(str => {
                res.push({
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#postlogoutredirecturis',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: str,
                    },
                });
            });
            config.keys?.forEach(keys => {
                const id = uuid();
                const subject = {
                    value: '#' + id,
                    termType: DGTLDTermType.REFERENCE
                };
                res.push({
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#keys',
                    subject: resourceSubject,
                    object: subject,
                });
                const tempTriples = [
                    {
                        predicate: 'http://digita.ai/voc/sourcesolidconfig#kid',
                        subject,
                        object: {
                            termType: DGTLDTermType.REFERENCE,
                            dataType: DGTLDDataType.STRING,
                            value: keys.kid,
                        },
                    },
                    {
                        predicate: 'http://digita.ai/voc/sourcesolidconfig#kty',
                        subject,
                        object: {
                            termType: DGTLDTermType.REFERENCE,
                            dataType: DGTLDDataType.STRING,
                            value: keys.kty
                        },
                    },
                    {
                        predicate: 'http://digita.ai/voc/sourcesolidconfig#alg',
                        subject,
                        object: {
                            termType: DGTLDTermType.REFERENCE,
                            dataType: DGTLDDataType.STRING,
                            value: keys.alg,
                        },
                    },
                    {
                        predicate: 'http://digita.ai/voc/sourcesolidconfig#n',
                        subject,
                        object: {
                            termType: DGTLDTermType.REFERENCE,
                            dataType: DGTLDDataType.STRING,
                            value: keys.n
                        },
                    },
                    {
                        predicate: 'http://digita.ai/voc/sourcesolidconfig#e',
                        subject,
                        object: {
                            termType: DGTLDTermType.REFERENCE,
                            dataType: DGTLDDataType.STRING,
                            value: keys.e
                        },
                    },
                    {
                        predicate: 'http://digita.ai/voc/sourcesolidconfig#ext',
                        subject,
                        object: {
                            termType: DGTLDTermType.REFERENCE,
                            dataType: DGTLDDataType.STRING,
                            value: keys.ext
                        },
                    },
                ];
                res = res.concat(tempTriples);
                keys.key_ops?.forEach(keyop => {
                    res.push({
                        predicate: 'http://digita.ai/voc/sourcesolidconfig#keyop',
                        subject,
                        object: {
                            termType: DGTLDTermType.REFERENCE,
                            dataType: DGTLDDataType.STRING,
                            value: keyop
                        },
                    });
                });
            });
        } else if (resource.type === DGTSourceType.MSSQL) {
            const config: DGTSourceMSSQLConfiguration = resource.configuration;
            res = [
                {
                    predicate: 'http://digita.ai/voc/sourcemssqlconfig#user',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.user,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcemssqlconfig#server',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.server,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcemssqlconfig#password',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.password,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcemssqlconfig#database',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.database,
                    },
                },
            ];
            for (const entry of Array.from(config.mapping.entries())) {
                const key = entry[0];
                const value = entry[1];
                const subject = {
                    value: '#' + uuid(),
                    termType: DGTLDTermType.REFERENCE
                };
                res.push({
                    predicate: 'http://digita.ai/voc/sourcemssqlconfig#mapping',
                    subject: resourceSubject,
                    object: subject,
                });
                res.push({
                    predicate: 'http://digita.ai/voc/sourcemssqlconfig#mappingkey',
                    subject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: key,
                    },
                });
                res.push({
                    predicate: 'http://digita.ai/voc/sourcemssqlconfig#mappingvalue',
                    subject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value,
                    },
                });
            }
        } else if (resource.type === DGTSourceType.GRAVATAR) {
            const config: DGTSourceGravatarConfiguration = resource.configuration;
            res = [
                {
                    predicate: 'http://digita.ai/voc/sourcegravatarconfig#usernamefield',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.usernameField,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/sourcegravatarconfig#thumbnailfield',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: config.thumbnailField,
                    },
                },
            ];
        } else {
            throw new DGTErrorConfig('SourceType was not recognised', { resource });
        }

        return res;
    }
    private configToDomain(triple: DGTLDTriple, resource: DGTLDResource, type: DGTSourceType): any {
        let res = null;

        if (type === DGTSourceType.SOLID) {
            const issuer = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#issuer'
            );
            const authorizationEndpoint = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#athorizationEndpoint'
            );
            const tokenEndpoint = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#tokenendpoint'
            );
            const userinfoEndpoint = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#userinfoendpoint'
            );
            const jwksUri = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#jwksuri'
            );
            const registrationEndpoint = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#registrationendpoint'
            );
            const claimsParameterSupported = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#claimsparametersuppoerted'
            );
            const requestParameterSupported = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#requestparametersupported'
            );
            const requestUriParameterSupported = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#requesturiparametersupported'
            );
            const requireRequestUriRegistration = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#requirerequesturiregistration'
            );
            const checkSessionIframe = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#checksessioniframe'
            );
            const endSessionEndpoint = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#endsessionendpoint'
            );
            const callbackUri = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#callbackuri'
            );
            const clientId = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#clientid'
            );
            const clientsecret = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#clientsecret'
            );
            const applicationType = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#applicationtype'
            );
            const clientName = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#clientname'
            );
            const logoUri = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#logouri'
            );
            const clientUri = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#clienturi'
            );
            const idTokenSignedResponseAlg = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#idtokensignedresponsealg'
            );
            const tokenEndpointAuthMethod = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#tokenendpointauthmethod'
            );
            const defaultMaxAge = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#defaultmaxage'
            );
            const frontchannelLogoutSessionRequired = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#frontchannellogoutsessionrequired'
            );
            const registrationAccessToken = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#registrationaccesstoken'
            );
            const registrationClientUri = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#registrationclienturi'
            );
            const clientIdIssuedAt = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#clientidissuedat'
            );
            const clientSecretExpiresAt = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#clientsecretexpiresat'
            );

            const responseTypesSupported = resource.triples.filter(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#responsetypessupported'
            ).map(t => t.object.value);
            const responseModesSupported = resource.triples.filter(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#responsemodessupported'
            ).map(t => t.object.value);
            const grantTypesSupported = resource.triples.filter(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#granttypessupported'
            ).map(t => t.object.value);
            const subjectTypesSupported = resource.triples.filter(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#subjecttypessupported'
            ).map(t => t.object.value);
            const idTokenSigningAlgValuesSupported = resource.triples.filter(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#idtokensigningalgvaluessupported'
            ).map(t => t.object.value);
            const tokenEndpointAuthMethodsSupported = resource.triples.filter(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#tokenendpointauthmethodssupported'
            ).map(t => t.object.value);
            const tokenEndpointAuthSigningAlgValuesSupported = resource.triples.filter(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#tokenendpointauthsigningalgvaluessupported'
            ).map(t => t.object.value);
            const displayValuesSupported = resource.triples.filter(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#displayvaluessupported'
            ).map(t => t.object.value);
            const claimTypesSupported = resource.triples.filter(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#claimtypessupported'
            ).map(t => t.object.value);
            const claimsSupported = resource.triples.filter(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#claimssupported'
            ).map(t => t.object.value);
            const redirectUris = resource.triples.filter(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#redirecturis'
            ).map(t => t.object.value);
            const responseTypes = resource.triples.filter(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#responsetypes'
            ).map(t => t.object.value);
            const grantTypes = resource.triples.filter(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#granttypes'
            ).map(t => t.object.value);
            const postLogoutRedirectUris = resource.triples.filter(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#postlogoutredirecturis'
            ).map(t => t.object.value);

            const keys = resource.triples.filter(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcesolidconfig#keys'
            ).map(key => {
                const kid = resource.triples.find(value =>
                    value.subject.value === key.object.value &&
                    value.predicate === 'http://digita.ai/voc/sourcesolidconfig#kid'
                );
                const kty = resource.triples.find(value =>
                    value.subject.value === key.object.value &&
                    value.predicate === 'http://digita.ai/voc/sourcesolidconfig#kty'
                );
                const alg = resource.triples.find(value =>
                    value.subject.value === key.object.value &&
                    value.predicate === 'http://digita.ai/voc/sourcesolidconfig#alg'
                );
                const n = resource.triples.find(value =>
                    value.subject.value === key.object.value &&
                    value.predicate === 'http://digita.ai/voc/sourcesolidconfig#n'
                );
                const e = resource.triples.find(value =>
                    value.subject.value === key.object.value &&
                    value.predicate === 'http://digita.ai/voc/sourcesolidconfig#e'
                );
                const ext = resource.triples.find(value =>
                    value.subject.value === key.object.value &&
                    value.predicate === 'http://digita.ai/voc/sourcesolidconfig#ext'
                );
                const keyOps = resource.triples.filter(value =>
                    value.subject.value === key.object.value &&
                    value.predicate === 'http://digita.ai/voc/sourcesolidconfig#keyops'
                ).map(t => t.object.value);

                return {
                    kid: kid ? kid.object.value : null,
                    kty: kty ? kty.object.value : null,
                    alg: alg ? alg.object.value : null,
                    n: n ? n.object.value : null,
                    e: e ? e.object.value : null,
                    ext: ext ? ext.object.value : null,
                    key_ops: keyOps,
                };
            });

            res = {
                issuer: issuer ? issuer.object.value : null,
                authorization_endpoint: authorizationEndpoint ? authorizationEndpoint.object.value : null,
                token_endpoint: tokenEndpoint ? tokenEndpoint.object.value : null,
                userinfo_endpoint: userinfoEndpoint ? userinfoEndpoint.object.value : null,
                jwks_uri: jwksUri ? jwksUri.object.value : null,
                registration_endpoint: registrationEndpoint ? registrationEndpoint.object.value : null,
                claims_parameter_supported: claimsParameterSupported ? claimsParameterSupported.object.value : null,
                request_parameter_supported: requestParameterSupported ? requestParameterSupported.object.value : null,
                request_uri_parameter_supported: requestUriParameterSupported ? requestUriParameterSupported.object.value : null,
                require_request_uri_registration: requireRequestUriRegistration ? requireRequestUriRegistration.object.value : null,
                check_session_iframe: checkSessionIframe ? checkSessionIframe.object.value : null,
                end_session_endpoint: endSessionEndpoint ? endSessionEndpoint.object.value : null,
                callbackUri: callbackUri ? callbackUri.object.value : null,
                client_id: clientId ? clientId.object.value : null,
                client_secret: clientsecret ? clientsecret.object.value : null,
                application_type: applicationType ? applicationType.object.value : null,
                client_name: clientName ? clientName.object.value : null,
                logo_uri: logoUri ? logoUri.object.value : null,
                client_uri: clientUri ? clientUri.object.value : null,
                id_token_signed_response_alg: idTokenSignedResponseAlg ? idTokenSignedResponseAlg.object.value : null,
                token_endpoint_auth_method: tokenEndpointAuthMethod ? tokenEndpointAuthMethod.object.value : null,
                default_max_age: defaultMaxAge ? defaultMaxAge.object.value : null,
                frontchannel_logout_session_required: frontchannelLogoutSessionRequired ? frontchannelLogoutSessionRequired.object.value : null,
                registration_access_token: registrationAccessToken ? registrationAccessToken.object.value : null,
                registration_client_uri: registrationClientUri ? registrationClientUri.object.value : null,
                client_id_issued_at: clientIdIssuedAt ? clientIdIssuedAt.object.value : null,
                client_secret_expires_at: clientSecretExpiresAt ? clientSecretExpiresAt.object.value : null,

                response_types_supported: responseTypesSupported,
                response_modes_supported: responseModesSupported,
                grant_types_supported: grantTypesSupported,
                subject_types_supported: subjectTypesSupported,
                id_token_signing_alg_values_supported: idTokenSigningAlgValuesSupported,
                token_endpoint_auth_methods_supported: tokenEndpointAuthMethodsSupported,
                token_endpoint_auth_signing_alg_values_supported: tokenEndpointAuthSigningAlgValuesSupported,
                display_values_supported: displayValuesSupported,
                claim_types_supported: claimTypesSupported,
                claims_supported: claimsSupported,
                redirect_uris: redirectUris,
                response_types: responseTypes,
                grant_types: grantTypes,
                post_logout_redirect_uris: postLogoutRedirectUris,

                keys,
            } as DGTSourceSolidConfiguration;
        } else if (type === DGTSourceType.MSSQL) {
            const user = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcemssqlconfig#user'
            );
            const password = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcemssqlconfig#password'
            );
            const server = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcemssqlconfig#server'
            );
            const database = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcemssqlconfig#database'
            );
            const resmap = new Map<string, string>();
            resource.triples.filter(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcemssqlconfig#mapping'
            )?.forEach(mapping => {
                const key = resource.triples.find(val =>
                    val.subject.value === mapping.object.value &&
                    val.predicate === 'http://digita.ai/voc/sourcemssqlconfig#mappingkey'
                );
                const value = resource.triples.find(val =>
                    val.subject.value === mapping.object.value &&
                    val.predicate === 'http://digita.ai/voc/sourcemssqlconfig#mappingvalue'
                );
                if (key && value) {
                    resmap.set(key.object.value, value.object.value);
                }
            });

            res = {
                user: user ? user.object.value : null,
                password: password ? password.object.value : null,
                server: server ? server.object.value : null,
                database: database ? database.object.value : null,
                mapping: resmap,
            };
        } else if (type === DGTSourceType.GRAVATAR) {
            const usernameField = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcegravatarconfig#usernamefield'
            );
            const thumbnailField = resource.triples.find(value =>
                value.subject.value === triple.object.value &&
                value.predicate === 'http://digita.ai/voc/sourcegravatarconfig#thumbnailfield'
            );
            res = {
                usernameField: usernameField ? usernameField.object.value : null,
                thumbnailField: thumbnailField ? thumbnailField.object.value : null,
            } as DGTSourceGravatarConfiguration;
        } else {
            throw new DGTErrorConfig('SourceType was not recognised', { resource });
        }

        return res;
    }
}
