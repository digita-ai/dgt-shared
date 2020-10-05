
import { map } from 'rxjs/operators';

import { AngularFirestore, QueryFn } from 'angularfire2/firestore';
import * as _ from 'lodash';
import { Observable, from, forkJoin } from 'rxjs';
import { firestore } from 'firebase';
import { DGTDataService, DGTEntity, DGTQuery } from '@digita/dgt-shared-data';
import { DGTLoggerService } from '@digita/dgt-shared-utils';

@DGTInjectable()
export class DGTClientDataService extends DGTDataService {

  constructor(
    private logger: DGTLoggerService,
    private afs: AngularFirestore
  ) {
    super();
  }

  public getEntities<S extends DGTEntity>(entityType: string, query: DGTQuery): Observable<S[]> {
    let res: Observable<S[]> = null;

    this.logger.debug(DGTClientDataService.name, 'Loading entities', { entityType, query });

    if (query) {
      const clientQuery = this.convertQuery(query);
      this.logger.debug(DGTClientDataService.name, 'Converted query', { clientQuery });

      res = this.afs.collection<S>(entityType, clientQuery)
        .snapshotChanges()
        .pipe(
          map(changes => _.map(changes, change => {
            const entity: S = this.convertTimestamp(change.payload.doc.data()) as S;
            entity.id = change.payload.doc.id;

            return entity;
          })
          ));
    } else {
      res = this.afs.collection<S>(entityType)
        .snapshotChanges()
        .pipe(
          map(changes => _.map(changes, change => {
            const entity: S = this.convertTimestamp(change.payload.doc.data()) as S;
            entity.id = change.payload.doc.id;

            return entity;
          })
          ));
    }

    return res
  }

  public getEntity<S extends DGTEntity>(entityType: string, entityId: string): Observable<S> {
    this.logger.debug(DGTClientDataService.name, 'Loading DGTEntity for type ' + entityType + ' and ID ' + entityId);

    return this.afs.collection<S>(entityType).doc<S>(entityId).snapshotChanges().pipe(map(angularFireAction => {
      let res: S = null;

      if (angularFireAction.payload.exists) {
        const entity: S = this.convertTimestamp(angularFireAction.payload.data()) as S;
        entity.id = angularFireAction.payload.id;

        res = entity
      }

      return res;
    }));
  }

  public createEntity<S extends DGTEntity>(entityType: string, entity: S): Observable<S> {
    let res: Observable<S> = null;

    this.logger.debug(DGTClientDataService.name, 'Creating DGTEntity for type ' + entityType, entity);

    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    this.convertUndefinedToNull(entity);

    if (entity.id) {
      res = from(this.afs.collection(entityType).doc(entity.id).set(entity))
        .pipe(
          map(() => {
            return entity;
          })
        );
    } else {
      res = from(this.afs.collection(entityType).add(entity))
        .pipe(map(reference => {
          entity.id = reference.id;

          return entity;
        })
        );
    }

    return res;
  }

  public createEntities<S extends DGTEntity>(entityType: string, entities: Array<S>): Observable<Array<S>> {
    let res: Observable<Array<S>> = null;

    this.logger.debug(DGTClientDataService.name, 'Creating entities for type ' + entityType, entities);

    if (entities) {
      res = forkJoin(
        entities.map(entity => {
          let observable: Observable<S> = null;

          entity.createdAt = new Date();
          entity.updatedAt = new Date();

          this.convertUndefinedToNull(entity);

          if (entity.id) {
            observable = from(this.afs.collection(entityType).doc(entity.id).set(entity))
              .pipe(
                map(() => entity)
              );
          } else {
            observable = from(this.afs.collection(entityType).add(entity))
              .pipe(
                map(reference => Object.assign({}, entity, { id: reference.id }))
              );
          }

          return observable;
        })
      )
    }

    return res;
  }

  public deleteEntity(entityType: string, entityId: string): Observable<any> {
    throw new Error('Not implemented');
  }

  public updateEntity<S extends DGTEntity>(entityType: string, entity: S): Observable<S> {
    this.logger.debug(DGTClientDataService.name, 'Updating DGTEntity for type ' + entityType, entity);

    entity.updatedAt = new Date();

    this.convertUndefinedToNull(entity);

    return from(this.afs.collection(entityType).doc(entity.id).set(entity))
      .pipe(
        map(() => entity)
      );
  }

  public updateFields<S extends DGTEntity>(entityType: string, entityId: string, entity: Partial<S>): Observable<Partial<S>> {
    this.logger.debug(DGTClientDataService.name, 'Updating DGTEntity for type ' + entityType, entity);

    entity.updatedAt = new Date();

    this.convertUndefinedToNull(entity);

    return from(this.afs.collection(entityType).doc<S>(entityId).update(entity))
      .pipe(
        map(() => entity)
      );
  }

  private convertQuery(query: DGTQuery): QueryFn {
    let res: QueryFn = null;

    if (query) {
      this.logger.debug(DGTClientDataService.name, 'Converting queries', query);

      res = (ref: firestore.CollectionReference) => {
        let compiledQuery: firestore.CollectionReference | firestore.Query = ref;

        if (query.conditions) {
          query.conditions.forEach((condition) => {
            compiledQuery = compiledQuery.where(condition.field, condition.operator, condition.value);
          })
        }


        // if (query.pagination) {
        //   const start = query.pagination.page * query.pagination.size;
        //   const end = (query.pagination.page + 1) * query.pagination.size - 1;

        //   compiledQuery.startAt(start).limit(query.pagination.size)
        // }
        // compiledQuery.orderBy('createdAt', 'desc');

        return compiledQuery;
      };
    }

    return res;
  }
}
