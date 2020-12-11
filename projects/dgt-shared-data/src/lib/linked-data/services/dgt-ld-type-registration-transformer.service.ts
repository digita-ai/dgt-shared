import { Observable, of, forkJoin } from 'rxjs';

import { DGTErrorArgument, DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import uuid, { v4 } from 'uuid';
import { map, tap } from 'rxjs/operators';
import { DGTLDTransformer } from '../models/dgt-ld-transformer.model';
import { DGTLDTypeRegistration } from '../models/dgt-ld-type-registration.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTLDTermType } from '../models/dgt-ld-term-type.model';
import { DGTLDDataType } from '../models/dgt-ld-data-type.model';
import { DGTLDTriple } from '../models/dgt-ld-triple.model';
import { DGTLDUtils } from './dgt-ld-utils.service';

/** Transforms linked data to typeRegistrations, and the other way around. */
@DGTInjectable()
export class DGTLDTypeRegistrationTransformerService implements DGTLDTransformer<DGTLDTypeRegistration> {

  constructor(
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService,
    private utils: DGTLDUtils,
  ) { }

  /**
   * Transforms multiple linked data entities to typeRegistrations.
   * @param resources Linked data objects to be transformed to typeRegistrations
   * @throws DGTErrorArgument when arguments are incorrect.
   * @returns Observable of typeRegistrations
   */
  public toDomain(resources: DGTLDResource[]): Observable<DGTLDTypeRegistration[]> {
    this.logger.debug(DGTLDTypeRegistrationTransformerService.name, 'Starting to transform resources to type registrations', { resources });

    this.paramChecker.checkParametersNotNull({ entities: resources });

    return forkJoin(resources.map(entity => this.toDomainOne(entity)))
      .pipe(
        tap(typeRegistrations => this.logger.debug(DGTLDTypeRegistrationTransformerService.name, 'Finished transforming type registrations', { typeRegistrations })),
        map(typeRegistrations => _.flatten(typeRegistrations)),
        map(typeRegistrations => typeRegistrations.filter(t => t !== null)),
      );
  }

  /**
   * Transformed a single linked data entity to typeRegistrations.
   * @param resource The linked data entity to be transformed to typeRegistrations.
   * @throws DGTErrorArgument when arguments are incorrect.
   * @returns Observable of typeRegistrations
   */
  private toDomainOne(resource: DGTLDResource): Observable<DGTLDTypeRegistration[]> {
    this.paramChecker.checkParametersNotNull({ entity: resource });

    let res: DGTLDTypeRegistration[] = null;

    if (resource && resource.triples) {
      const typeRegistrationSubjectValues = resource.triples.filter(value =>
        value.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
        value.object.value === 'http://www.w3.org/ns/solid/terms#TypeRegistration'
      );

      this.logger.debug(DGTLDTypeRegistrationTransformerService.name, 'Found typeRegistration subjects to transform', { typeRegistrationSubjectValues });

      if (typeRegistrationSubjectValues) {
        res = typeRegistrationSubjectValues.map(typeRegistrationSubjectValue => {
          let typeRegistration = null;

          try {
            typeRegistration = this.transformOne(typeRegistrationSubjectValue, resource)
          }
          catch (error) {

          }

          return typeRegistration;
        })
        .filter(typeRegistration => typeRegistration !== null);
      }
    }

    this.logger.debug(DGTLDTypeRegistrationTransformerService.name, 'Transformed values to typeRegistrations', { entity: resource, res });

    return of(res);
  }

  /**
   * Converts typeRegistrations to linked data.
   * @param typeRegistrations The typeRegistrations which will be transformed to linked data.
   * @param connection The connection on which the typeRegistrations are stored.
   * @throws DGTErrorArgument when arguments are incorrect.
   * @returns Observable of linked data entities.
   */
  public toTriples(typeRegistrations: DGTLDTypeRegistration[]): Observable<DGTLDResource[]> {
    this.paramChecker.checkParametersNotNull({ typeRegistrations });
    this.logger.debug(DGTLDTypeRegistrationTransformerService.name, 'Starting to transform to linked data', { typeRegistrations });

    const entities = typeRegistrations.map<DGTLDResource>(typeRegistration => {
      let triples = typeRegistration.triples;
      const uri = typeRegistration.uri;
      const documentSubject = {
        // This line is only for human readability in the raw file
        value: '#' + uuid(),
        termType: DGTLDTermType.REFERENCE
      };
      const typeRegistrationId = v4();
      const typeRegistrationSubjectUri = `${uri}#${typeRegistrationId}`;

      if (!triples) {
        triples = [
          {
            predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
            subject: documentSubject,
            object: {
              termType: DGTLDTermType.REFERENCE,
              dataType: DGTLDDataType.STRING,
              value: 'http://www.w3.org/ns/solid/terms#TypeRegistration'
            },
          },
          {
            predicate: 'http://www.w3.org/ns/solid/terms#forClass',
            subject: documentSubject,
            object: {
              termType: DGTLDTermType.REFERENCE,
              dataType: DGTLDDataType.STRING,
              value: typeRegistration.forClass
            },
          },
          {
            predicate: 'http://www.w3.org/ns/solid/terms#instance',
            subject: documentSubject,
            object: {
              termType: DGTLDTermType.REFERENCE,
              dataType: DGTLDDataType.STRING,
              value: typeRegistration.instance
            },
          },
        ];
      }

      const newEntity: DGTLDResource = {
        ...typeRegistration,
        uri,
        triples
      };

      this.logger.debug(DGTLDTypeRegistrationTransformerService.name, 'Transformed typeRegistration to linked data', { newEntity, typeRegistration });

      return newEntity;
    });

    this.logger.debug(DGTLDTypeRegistrationTransformerService.name, 'Transformed typeRegistrations to linked data', { entities, typeRegistrations });

    return of(entities);
  }

  /**
   * Creates a single typeRegistration from linked data.
   * @param typeRegistrationSubjectValue The entity of the the typeRegistration's subject.
   * @param resource\ The entity to be transformed to an typeRegistration.
   * @throws DGTErrorArgument when arguments are incorrect.
   * @returns The transformed typeRegistration.
   */
  private transformOne(typeRegistrationSubjectValue: DGTLDTriple, resource: DGTLDResource): DGTLDTypeRegistration {
    this.paramChecker.checkParametersNotNull({ typeRegistrationSubjectValue, entity: resource });
    this.logger.debug(DGTLDTypeRegistrationTransformerService.name, 'Starting to transform one entity', { typeRegistrationSubjectValue, entity: resource });

    const uri = resource.uri ? resource.uri : typeRegistrationSubjectValue.subject.value;

    const forClass = resource.triples.find(value =>
      value.subject.value === typeRegistrationSubjectValue.subject.value &&
      value.predicate === 'http://www.w3.org/ns/solid/terms#forClass'
    );

    const instance = resource.triples.find(value =>
      value.subject.value === typeRegistrationSubjectValue.subject.value &&
      value.predicate === 'http://www.w3.org/ns/solid/terms#instance'
    );

    const typeRegistrationTriples = resource.triples.filter(value =>
      value.subject.value === typeRegistrationSubjectValue.subject.value
    );

    if (!instance || !this.utils.isUrl(instance.object.value)) {
      throw new DGTErrorArgument('Instance should be a url', instance);
    }

    return {
      uri,
      forClass: forClass ? forClass.object.value : null,
      instance: instance ? instance.object.value : null,
      triples: [...typeRegistrationTriples, typeRegistrationSubjectValue],
      exchange: resource.exchange,
    };
  }
}
