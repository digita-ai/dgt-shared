
import { Observable, of } from 'rxjs';
import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { DGTDataValue } from '../models/data-value.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

@DGTInjectable()
export class DGTDataValueTransformerService implements DGTLDTransformer<DGTDataValue> {

  constructor(
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService
  ) { }

  public toDomain(entities: DGTLDResource[]): Observable<DGTDataValue[]> {
    this.paramChecker.checkParametersNotNull({ entities });

    this.logger.debug(DGTDataValueTransformerService.name, 'Starting to transform entity to domain', { entities });
    const res = [].concat(...entities.map(entity => this.transformOne(entity)));
    this.logger.debug(DGTDataValueTransformerService.name, 'Transformed values to DataValues', { entities, res });

    return of(res);
  }

  toTriples(objects: DGTDataValue[]): Observable<DGTLDResource[]> {
    this.paramChecker.checkParametersNotNull({ objects });
    return of(objects);
  }

  private transformOne(entity: DGTLDResource): DGTDataValue[] {
    this.paramChecker.checkParametersNotNull({ entity });
    return entity.triples.map((triple: DGTLDTriple) => {
      return {
        uri: triple.subject.value,
        exchange: entity.exchange,
        ...triple,
        triples: [triple]
      } as DGTDataValue;
    });
  }
}
