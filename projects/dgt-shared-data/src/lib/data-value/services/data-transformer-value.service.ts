import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita/dgt-shared-utils';
import { DGTDataValue } from '../models/data-value.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

@Injectable()
export class DGTDataValueTransformerService implements DGTLDTransformer<DGTDataValue> {

  constructor(
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService
  ) { }

  toDomain(entities: DGTLDResource[]): Observable<DGTDataValue[]> {
    this.paramChecker.checkParametersNotNull({entities});

    this.logger.debug(DGTDataValueTransformerService.name, 'Starting to transform entity to domain', { entities });
    const res = [].concat(...entities.map(entity => this.transformOne(entity)));
    this.logger.debug(DGTDataValueTransformerService.name, 'Transformed values to DataValues', { entities, res });

    return of(res);
  }

  toTriples(objects: DGTDataValue[], connection: DGTConnectionSolid): Observable<DGTLDResource[]> {
    this.paramChecker.checkParametersNotNull({objects});
    return of(objects);
  }

  private transformOne(entity: DGTLDResource): DGTDataValue[] {
    this.paramChecker.checkParametersNotNull({entity});

    return entity.triples.map((triple: DGTLDTriple) => {
      // TODO check if subject or holder?
      return {
        connection: entity.connection,
        source: entity.source,
        subject: entity.holder,
        documentUri: entity.documentUri,
        ...triple,
        triples: [triple]
      } as DGTDataValue;
    });
  }
}
