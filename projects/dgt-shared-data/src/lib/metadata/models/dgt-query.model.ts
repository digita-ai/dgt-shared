import { DGTQueryCondition } from './dgt-query-condition.model';
import { DGTQueryPagination } from './dgt-query-pagination.model';

export interface DGTQuery {
    conditions: DGTQueryCondition[];
    pagination?: DGTQueryPagination;
}
