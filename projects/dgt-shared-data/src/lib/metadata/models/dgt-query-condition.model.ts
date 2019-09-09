import { DGTQueryConditionOperator } from './dgt-query-condition-operator.model';

export interface DGTQueryCondition {
    field: string;
    operator: DGTQueryConditionOperator;
    value: any;
}
