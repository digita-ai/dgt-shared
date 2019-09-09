import { DGTDateType } from './dgt-date-type.model';

export interface DGTDate {
    date: Date;
    type: DGTDateType;
    approximation: number;
}
