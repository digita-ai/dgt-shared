import { DGTDataService } from './dgt-data.service';

import { Observable, of, forkJoin, concat } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTQueryService } from './dgt-query.service';
import { DGTQuery } from '../models/dgt-query.model';
import { DGTMockDatabase } from '../models/dgt-mock-database.model';
import { DGTEntity } from '../models/dgt-entity.model';
import { DGTInjectable, DGTLoggerService } from '@digita/dgt-shared-utils';
import { v4 as uuid } from 'uuid';

@DGTInjectable()
export class DGTMockDataService extends DGTDataService {
    constructor(private logger: DGTLoggerService, private queries: DGTQueryService, private database: DGTMockDatabase) {
        super();
    }

    public getEntities<S extends DGTEntity>(entityType: string, query: DGTQuery): Observable<S[]> {

        this.logger.debug(DGTMockDataService.name, 'Getting multiple entities', { entityType, query });
        const entities = query ?
            this.queries.execute<S[]>(this.database.get(entityType) as S[], query) :
            this.database.get(entityType);

        return entities ? of(entities.map(entity => this.convertTimestamp(entity) as S)) : of([]);
    }

    public getEntity<S extends DGTEntity>(entityType: string, entityId: string): Observable<S> {
        this.logger.debug(DGTMockDataService.name, 'Getting single entity', { entityType, entityId });

        return of(this.database.get(entityType))
            .pipe(
                map(entities => entities ? entities.find(entity => entity.id === entityId) : null),
                map(entity => {
                    let res: S = null;

                    if (entity) {
                        res = this.convertTimestamp(entity) as S;
                    }

                    return res;
                }),
                tap(entity => this.logger.debug(DGTMockDataService.name, 'Found entity', { entity, entityType, entityId }))
            );
    }

    public createEntity<S extends DGTEntity>(entityType: string, entity: S): Observable<S> {
        this.logger.debug(DGTMockDataService.name, 'Creating DGTEntity for type ' + entityType, entity);

        entity.createdAt = new Date();
        entity.updatedAt = new Date();

        this.convertUndefinedToNull(entity);

        if (!entity.id) {
            entity.id = uuid();
        }

        const entities = this.database.get(entityType);

        if (entities && entities.length > 0) {
            const newEntities = entities.concat([entity]);

            this.database.set(entityType, newEntities);
        } else {
            this.database.set(entityType, [entity]);
        }

        return of(entity);
    }

    public createEntities<S extends DGTEntity>(entityType: string, newEntities: Array<S>): Observable<Array<S>> {
        let res: Observable<Array<S>> = null;

        this.logger.debug(DGTMockDataService.name, 'Creating entities for type ' + entityType, newEntities);

        if (newEntities) {
            res = forkJoin(newEntities.map((entity) => this.createEntity(entityType, entity)));
        }

        return res;
    }

    public deleteEntity(entityType: string, entityId: string): Observable<any> {
        return of({ entityType, entityId })
            .pipe(
                map(data => ({ ...data, entities: this.database.get(entityType) })),
                map(data => ({ ...data, filteredEntities: data.entities.filter(entity => entity.id !== entityId) })),
                tap(data => this.database.set(entityType, data.filteredEntities)),
            );
    }

    public updateEntity<S extends DGTEntity>(entityType: string, updatedEntity: S): Observable<S> {
        this.logger.debug(DGTMockDataService.name, 'Updating DGTEntity for type ' + entityType, updatedEntity);

        updatedEntity.updatedAt = new Date();

        this.convertUndefinedToNull(updatedEntity);

        return of(this.database.get(entityType))
            .pipe(
                map(entities => entities.filter(entity => entity.id !== updatedEntity.id)),
                tap(entities => this.database.set(entityType, [...entities, updatedEntity])),
                map(() => updatedEntity)
            );
    }

    public updateFields<S extends DGTEntity>(
        entityType: string,
        entityId: string,
        updatedEntityPartial: Partial<S>
    ): Observable<Partial<S>> {
        this.logger.debug(DGTMockDataService.name, 'Updating fields DGTEntity for type ' + entityType, updatedEntityPartial);

        return of(this.database.get(entityType))
            .pipe(
                map(entities => (
                    {
                        entities,
                        filteredEntities: entities.filter(entity => entity.id !== entityId),
                        entity: entities.find(entity => entity.id === entityId)
                    }
                )
                ),
                map(data => ({
                    ...data,
                    updatedEntity: { ...data.entity, updatedAt: new Date(), ...updatedEntityPartial as any }
                })),
                tap(data => this.convertUndefinedToNull(data.updatedEntity)),
                tap(data => this.database.set(entityType, [...data.filteredEntities, data.updatedEntity])),
                map(() => updatedEntityPartial)
            );
    }
}
