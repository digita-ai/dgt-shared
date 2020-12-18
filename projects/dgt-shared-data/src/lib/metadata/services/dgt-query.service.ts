import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { DGTQuery } from '../models/dgt-query.model';

@DGTInjectable()
export class DGTQueryService {
    public execute<T>(entities: T, query: DGTQuery): T {
        let res = entities;

        if (query && query.conditions && query.conditions.length > 0 && Array.isArray(res)) {
            const self = this;

            query.conditions.forEach((condition) => {
                res = (res as unknown as any[]).filter((entity) => {
                    let meetsConditions = false;
                    const entityValue = self.getProperty(entity, condition.field);

                    if (condition.operator === '==') {
                        meetsConditions = entityValue === condition.value;
                    } else if (condition.operator === '<') {
                        meetsConditions = entityValue < condition.value;
                    } else if (condition.operator === '>') {
                        meetsConditions = entityValue > condition.value;
                    }

                    return meetsConditions;
                }) as unknown as T;
            });
        }

        if (query && query.pagination && Array.isArray(res)) {
            const start = query.pagination.page * query.pagination.size;
            const end = (query.pagination.page + 1) * query.pagination.size - 1;

            res = res.slice(start, end) as unknown as T;
        }

        return res;
    }

    private getProperty(entity: any, key: string): any {
        let res = entity;

        if (key && entity && typeof entity === 'object') {
            const keyParts: string[] = key.split('.');

            if (keyParts.length > 0) {
                keyParts.forEach(keyPart => {
                    if (keyPart && res) {
                        res = res[keyPart];
                    }
                });
            }
        }

        return res;
    }
}
