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
                {
                    predicate: 'http://digita.ai/voc/exchanges#exchange',
                    subject: documentSubject,
                    object: resourceSubject,
                }
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

            newTriples = newTriples.concat( this.configToTriples(resource, resourceSubject) );

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
        const configuration = this.configToDomain( triple, resource, type.object.value );

        return {
            uri: resource.uri,
            triples: [triple],
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
            ];
            config.response_types_supported.forEach( str => {
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
            config.response_modes_supported.forEach( str => {
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
            config.grant_types_supported.forEach( str => {
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
            config.subject_types_supported.forEach( str => {
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
            config.id_token_signing_alg_values_supported.forEach( str => {
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
            config.token_endpoint_auth_methods_supported.forEach( str => {
                res.push({
                    predicate: 'http://digita.ai/voc/sourcesolidconfig#tokenendpointauthmethodssupported',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: str,
                    },
                });
            });
            config.token_endpoint_auth_signing_alg_values_supported.forEach( str => {
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
            config.display_values_supported.forEach( str => {
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
            config.claim_types_supported.forEach( str => {
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
            config.claims_supported.forEach( str => {
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
            config.redirect_uris.forEach( str => {
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
            config.response_types.forEach( str => {
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
            config.grant_types.forEach( str => {
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
            config.post_logout_redirect_uris.forEach( str => {
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
            throw new DGTErrorConfig('SourceType was not recognised', {resource});
        }

        return res;
    }
    private configToDomain(triple: DGTLDTriple, resource: DGTLDResource, type: DGTSourceType): any {
        let res = null;

        if (type === DGTSourceType.SOLID) {

        } else if (type === DGTSourceType.MSSQL) {

        } else if (type === DGTSourceType.GRAVATAR) {

        } else {
            throw new DGTErrorConfig('SourceType was not recognised', {resource});
        }

        return res;
    }
}
