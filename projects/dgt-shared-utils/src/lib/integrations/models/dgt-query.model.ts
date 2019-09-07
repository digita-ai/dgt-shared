import { DGTQueryCondition } from './dgt-query-condition.model';
import { DGTQueryPagination } from './dgt-query-pagination.model';

export interface DGTQuery {
    conditions: Array<DGTQueryCondition>;
    pagination?: DGTQueryPagination;
}
