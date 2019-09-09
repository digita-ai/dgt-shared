import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { DGTQuery } from '../models/dgt-query.model';
import { DGTEntity } from '../models/dgt-entity.model';

export abstract class DGTDataService {

  constructor() { }

  public abstract getEntities<S extends DGTEntity>(entityType: string, query: DGTQuery): Observable<S[]>;
  public abstract getEntity<S extends DGTEntity>(entityType: string, entityId: string): Observable<S>;
  public abstract createEntity<S extends DGTEntity>(entityType: string, entity: S): Observable<S>;
  public abstract createEntities<S extends DGTEntity>(entityType: string, entities: Array<S>): Observable<Array<S>>;
  public abstract deleteEntity(entityType: string, entityId: string): Observable<any>;
  public abstract updateEntity<S extends DGTEntity>(entityType: string, entity: S): Observable<S>;
  public abstract updateFields<S extends DGTEntity>(entityType: string, entityId: string, entity: Partial<S>): Observable<Partial<S>>;

  protected convertUndefinedToNull(entity: any) {
    Object.keys(entity).forEach((key) => {
      if (typeof entity[key] === 'undefined') {
        entity[key] = null;
      } else if (entity[key] instanceof Object) {
        this.convertUndefinedToNull(entity[key]);
      }
    });
  }

  protected convertTimestamp<S extends DGTEntity>(entity: S): S {
    if (entity) {
      Object.keys(entity).forEach(key => {
        if (entity[key] && entity[key].constructor && entity[key].constructor.name === 'Timestamp' && entity[key].toDate) {
          entity[key] = (entity[key] as any).toDate();
        } else if (entity[key] && entity[key].constructor && entity[key].constructor.name === 't' && entity[key].toDate) {
          entity[key] = (entity[key] as any).toDate();
        } else if (entity[key] && entity[key] instanceof Date && entity[key].toDate) {
          entity[key] = (entity[key] as any).toDate();
        } else if (entity[key] instanceof Object) {
          this.convertTimestamp(entity[key]);
        }
      });
    }

    return entity;
  }
}
