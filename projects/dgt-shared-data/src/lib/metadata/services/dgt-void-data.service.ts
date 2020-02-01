import { DGTDataService } from './dgt-data.service';
import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import * as _ from 'lodash';
import { DGTQuery } from '../models/dgt-query.model';
import { DGTEntity } from '../models/dgt-entity.model';
import { DGTLoggerService } from '@digita/dgt-shared-utils';
import { v4 as uuid } from 'uuid';

@Injectable()
export class DGTVoidDataService extends DGTDataService {
    constructor(private logger: DGTLoggerService) {
        super();
    }

    public getEntities<S extends DGTEntity>(entityType: string, query: DGTQuery): Observable<S[]> {
        this.logger.debug(DGTVoidDataService.name, 'Getting multiple entities', { entityType, query });

        return of([]);
    }

    public getEntity<S extends DGTEntity>(entityType: string, entityId: string): Observable<S> {
        this.logger.debug(DGTVoidDataService.name, 'Getting single entity', { entityType, entityId });

        return of(null);
    }

    public createEntity<S extends DGTEntity>(entityType: string, entity: S): Observable<S> {
        this.logger.debug(DGTVoidDataService.name, 'Creating DGTEntity for type ' + entityType, entity);

        entity.createdAt = new Date();
        entity.updatedAt = new Date();

        this.convertUndefinedToNull(entity);

        if (!entity.id) {
            entity.id = uuid();
        }

        return of(entity);
    }

    public createEntities<S extends DGTEntity>(entityType: string, newEntities: Array<S>): Observable<Array<S>> {
        let res: Observable<Array<S>> = null;

        this.logger.debug(DGTVoidDataService.name, 'Creating entities for type ' + entityType, newEntities);

        if (newEntities) {
            res = forkJoin(newEntities.map((entity) => this.createEntity(entityType, entity)));
        }

        return res;
    }

    public deleteEntity(entityType: string, entityId: string): Observable<any> {
        return of({ entityType, entityId });
    }

    public updateEntity<S extends DGTEntity>(entityType: string, updatedEntity: S): Observable<S> {
        this.logger.debug(DGTVoidDataService.name, 'Updating DGTEntity for type ' + entityType, updatedEntity);

        updatedEntity.updatedAt = new Date();

        this.convertUndefinedToNull(updatedEntity);

        return of(updatedEntity);
    }

    public updateFields<S extends DGTEntity>(
        entityType: string,
        entityId: string,
        updatedEntityPartial: Partial<S>
    ): Observable<Partial<S>> {
        this.logger.debug(DGTVoidDataService.name, 'Updating fields DGTEntity for type ' + entityType, updatedEntityPartial);

        return of(updatedEntityPartial);
    }
}
