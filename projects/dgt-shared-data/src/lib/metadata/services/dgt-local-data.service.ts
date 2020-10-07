import { DGTDataService } from './dgt-data.service';

import { Observable, of, forkJoin } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTQueryService } from './dgt-query.service';
import { DGTQuery } from '../models/dgt-query.model';
import { DGTEntity } from '../models/dgt-entity.model';
import { DGTInjectable, DGTLoggerService } from '@digita/dgt-shared-utils';
import { v4 as uuid } from 'uuid';
import store from 'store2';

@DGTInjectable()
export class DGTLocalDataService extends DGTDataService {
    constructor(private logger: DGTLoggerService, private queries: DGTQueryService) {
        super();
    }

    public getEntities<S extends DGTEntity>(entityType: string, query: DGTQuery): Observable<S[]> {
        let res: Observable<S[]> = null;

        this.logger.debug(DGTLocalDataService.name, 'Getting multiple entities', { entityType, query });

        if (query) {
            res = of(store.get(entityType))
                .pipe(
                    tap(entities => this.logger.debug(DGTLocalDataService.name, 'Loaded entities', { entities })),
                    map(entities => this.queries.execute<S[]>(entities as S[], query)),
                    tap(entities => this.logger.debug(DGTLocalDataService.name, 'Queried entities', { entities })),
                    map(entities => _.map(entities, data => {
                        const entity: S = this.convertTimestamp(data) as S;

                        return entity;
                    })
                    ));
        } else {
            res = of(store.get(entityType))
                .pipe(
                    map(entities => _.map(entities, data => {
                        const entity: S = this.convertTimestamp(data) as S;

                        return entity;
                    })
                    ));
        }

        return res;
    }

    public getEntity<S extends DGTEntity>(entityType: string, entityId: string): Observable<S> {
        this.logger.debug(DGTLocalDataService.name, 'Getting single entity', { entityType, entityId });

        return of(store.get(entityType))
            .pipe(
                map(entities => entities.find(entity => entity.id === entityId)),
                map(entity => {
                    let res: S = null;

                    if (entity) {
                        res = this.convertTimestamp(entity) as S;
                    }

                    return res;
                }),
                tap(entity => this.logger.debug(DGTLocalDataService.name, 'Found entity', { entity, entityType, entityId }))
            );
    }

    public createEntity<S extends DGTEntity>(entityType: string, entity: S): Observable<S> {
        this.logger.debug(DGTLocalDataService.name, 'Creating DGTEntity for type ' + entityType, entity);

        entity.createdAt = new Date();
        entity.updatedAt = new Date();

        this.convertUndefinedToNull(entity);

        if (!entity.id) {
            entity.id = uuid();
        }

        const entities = store.get(entityType);

        if (entities && entities.length > 0) {
            const newEntities = entities.concat([entity]);

            store.set(entityType, newEntities);
        } else {
            store.set(entityType, [entity]);
        }

        return of(entity);
    }

    public createEntities<S extends DGTEntity>(entityType: string, newEntities: Array<S>): Observable<Array<S>> {
        let res: Observable<Array<S>> = null;

        this.logger.debug(DGTLocalDataService.name, 'Creating entities for type ' + entityType, newEntities);

        if (newEntities) {
            res = forkJoin(newEntities.map((entity) => this.createEntity(entityType, entity)));
        }

        return res;
    }

    public deleteEntity(entityType: string, entityId: string): Observable<any> {
        return of({ entityType, entityId })
            .pipe(
                map(data => ({ ...data, entities: store.get(entityType) })),
                map(data => ({ ...data, filteredEntities: data.entities.filter(entity => entity.id !== entityId) })),
                tap(data => store.set(entityType, data.filteredEntities)),
            );
    }

    public updateEntity<S extends DGTEntity>(entityType: string, updatedEntity: S): Observable<S> {
        this.logger.debug(DGTLocalDataService.name, 'Updating DGTEntity for type ' + entityType, updatedEntity);

        updatedEntity.updatedAt = new Date();

        this.convertUndefinedToNull(updatedEntity);

        return of(store.get(entityType))
            .pipe(
                map(entities => entities ? entities.filter(entity => entity.id !== updatedEntity.id) : []),
                tap(entities => store.set(entityType, [...entities, updatedEntity])),
                map(() => updatedEntity)
            );
    }

    public updateFields<S extends DGTEntity>(
        entityType: string,
        entityId: string,
        updatedEntityPartial: Partial<S>
    ): Observable<Partial<S>> {
        this.logger.debug(DGTLocalDataService.name, 'Updating fields DGTEntity for type ' + entityType, updatedEntityPartial);

        return of(store.get(entityType))
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
                tap(data => store.set(entityType, [...data.filteredEntities, data.updatedEntity])),
                map(() => updatedEntityPartial)
            );
    }
}
