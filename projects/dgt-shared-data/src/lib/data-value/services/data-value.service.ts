
import * as _ from 'lodash';
import { Observable, forkJoin, of } from 'rxjs';
import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { switchMap, map } from 'rxjs/operators';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTDataValue } from '../models/data-value.model';
import { DGTDataGroup } from '../models/data-group.model';
import { DGTCategory } from '../../categories/models/dgt-category.model';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTHolder } from '../../holder/models/dgt-holder.model';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';

@DGTInjectable()
/**
 * The services' duty is to handle DGTDataValue objects.
 * From getting values to updating and processing them.
 */
export abstract class DGTDataValueService implements DGTLDResourceService<DGTDataValue> {

  constructor(
    protected logger: DGTLoggerService,
    protected paramChecker: DGTParameterCheckerService,
    protected filters: DGTLDFilterService
  ) { }

  public abstract get(id: string): Observable<DGTDataValue>;
  public abstract query(filter?: DGTLDFilter): Observable<DGTDataValue[]>;
  public abstract save(resource: DGTDataValue): Observable<DGTDataValue>;
  public abstract delete(resource: DGTDataValue): Observable<DGTDataValue>;
  public abstract getForHolder(holder: DGTHolder): Observable<DGTDataValue[]>;


  /**
   * get a list of predicates from a list of dataValues
   * @param dataValues
   * @param connection
   */
  public getPredicatesOfValues(dataValues: DGTDataValue[]): string[] {
    this.paramChecker.checkParametersNotNull({ dataValues });

    return _.uniqWith(dataValues.map((value: DGTDataValue) => value.predicate)
    .filter(p => p !== null && p.length > 0), _.isEqual);
  }

  /**
   * get a list categories for which a value exists
   * @param categories
   * @param values
   * @param connection
   */
  public getCategoriesWithValues(
    categories: DGTCategory[],
    values: DGTDataValue[]
  ): Observable<DGTCategory[]> {
    this.paramChecker.checkParametersNotNull({ categories, values });

    this.logger.debug(DGTDataValueService.name, 'Getting categories with values', { categories });

    return of({ categories })
      .pipe(
        switchMap(data => forkJoin(data.categories.map(category => this.filters.run(category.filter, values).pipe(map((triples: DGTDataValue[]) => ({ category, triples: triples.filter(triple => triple.triples !== null && triple.triples.length > 0).filter(triple => !(triple.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') && !(triple.predicate === 'http://www.w3.org/2006/vcard/ns#value')) })))))
          .pipe(map(triplesPerCategory => ({ ...data, triplesPerCategory })))),
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
    categories: DGTCategory[],
    values: DGTDataValue[]
  ): Observable<DGTDataGroup[]> {
    this.paramChecker.checkParametersNotNull({ categories, groups, values });

    return this.getCategoriesWithValues(categories, values)
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
    category: DGTCategory,
    values: DGTDataValue[],
  ): Observable<DGTDataValue[]> {
    this.paramChecker.checkParametersNotNull({ category, values });

    this.logger.debug(DGTDataValueService.name, 'Getting values of category', { category });

    return this.filters.run(category.filter, values)
      .pipe(
        map(triples => triples.filter(triple => triple.triples !== null && triple.triples.length > 0) as DGTDataValue[]),
      );
  }

  /**
   * get a list of values of a given list of categories
   * @param categories
   * @param values
   * @param connection
   */
  public getValuesOfCategories(
    categories: DGTCategory[],
    values: DGTDataValue[],
  ): Observable<DGTDataValue[]> {
    this.paramChecker.checkParametersNotNull({ categories, values });

    return of({ categories })
      .pipe(
        switchMap(data => forkJoin(data.categories.map(category => this.getValuesOfCategory(category, values)))),
        map(data => _.flatten(data))
      );
  }
}
