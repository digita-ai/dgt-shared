import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable, forkJoin, of } from 'rxjs';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita/dgt-shared-utils';
import { switchMap, map } from 'rxjs/operators';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';
import { DGTDataValue } from '../models/data-value.model';
import { DGTLDPredicate } from '../../linked-data/models/dgt-ld-predicate.model';
import { DGTLD } from '../../linked-data/models/dgt-ld.model';
import { DGTDataGroup } from '../models/data-group.model';

@Injectable()
/**
 * The services' duty is to handle DGTDataValue objects.
 * From getting values to updating and processing them.
 */
export class DGTDataValueService {

  constructor(
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService,
    private filters: DGTLDFilterService
  ) { }

  /**
   * get the predicate of a DGTDataValue object
   * @param dataValue
   * @param connection optional
   * @returns DGTLDPredicate
   */
  public getPredicateOfValue(dataValue: DGTDataValue, connection?: DGTConnectionSolid): DGTLDPredicate {
    this.paramChecker.checkParametersNotNull({ dataValue });

    return connection && dataValue.connection !== connection.id ? null : dataValue.predicate;
  }

  /**
   * get a list of predicates from a list of dataValues
   * @param dataValues
   * @param connection
   */
  public getPredicatesOfValues(dataValues: DGTDataValue[], connection?: DGTConnectionSolid): DGTLDPredicate[] {
    this.paramChecker.checkParametersNotNull({ dataValues });

    return _.uniqWith(dataValues.map((value: DGTDataValue) => {
      return this.getPredicateOfValue(value, connection);
    }).filter(p => p !== null && p.name !== null && p.namespace !== null), _.isEqual);
  }

  /**
   * get a list categories for which a value exists
   * @param categories
   * @param values
   * @param connection
   */
  public getCategoriesWithValues(
    categories: DGTLD[],
    values: DGTDataValue[],
    connection?: DGTConnectionSolid
  ): Observable<DGTLD[]> {
    this.paramChecker.checkParametersNotNull({ categories, values });

    this.logger.debug(DGTDataValueService.name, 'Getting categories with values', { categories });

    return of({ categories })
      .pipe(
        switchMap(data => forkJoin(
          data.categories.map(category => this.filters.run(category.filters, values).pipe(map(triples => ({ category, triples }))))
        )
          .pipe(map(triplesPerCategory => ({ ...data, triplesPerCategory })))
        ),
        map(data => ({ ...data, filteredTriplesPerCategory: data.triplesPerCategory.filter(categoryWithTriples => categoryWithTriples && categoryWithTriples.triples.length > 0) })),
        map(data => data.filteredTriplesPerCategory.map(triplesPerCategory => triplesPerCategory.category)),
      );
  }

  /**
   * get a list of groups for which a value exists
   * @param groups
   * @param categories
   * @param values
   * @param connection
   */
  public getGroupsWithValues(
    groups: DGTDataGroup[],
    categories: DGTLD[],
    values: DGTDataValue[],
    connection?: DGTConnectionSolid
  ): Observable<DGTDataGroup[]> {
    this.paramChecker.checkParametersNotNull({ categories, groups, values });

    return this.getCategoriesWithValues(categories, values, connection)
      .pipe(
        map(data => groups.filter(group => data.filter(category => category.groupId === group.id).length > 0))
      );
  }

  /**
   * get a list of all the values of a given category
   * @param category
   * @param values
   * @param connection
   */
  public getValuesOfCategory(
    category: DGTLD,
    values: DGTDataValue[],
    connection?: DGTConnectionSolid
  ): Observable<DGTDataValue[]> {
    this.paramChecker.checkParametersNotNull({ category, values });

    this.logger.debug(DGTDataValueService.name, 'Getting values of category', { category });

    return this.filters.run(category.filters, values)
      .pipe(
        map(triples => triples as DGTDataValue[]),
        map(triples => triples.filter(triple => connection ? triple.connection === connection.id : true))
      );
  }

  /**
   * get a list of values of a given list of categories
   * @param categories
   * @param values
   * @param connection
   */
  public getValuesOfCategories(
    categories: DGTLD[],
    values: DGTDataValue[],
    connection?: DGTConnectionSolid
  ): Observable<DGTDataValue[]> {
    this.paramChecker.checkParametersNotNull({ categories, values });

    return of({ categories })
      .pipe(
        switchMap(data => forkJoin(data.categories.map(category => this.getValuesOfCategory(category, values, connection)))),
        map(data => _.flatten(data))
      );
  }
}
