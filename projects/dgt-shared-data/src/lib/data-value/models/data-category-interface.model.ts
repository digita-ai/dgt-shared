
import { DGTDataValue } from './data-value.model';
import { EventEmitter } from '@angular/core';
import { DGTLD } from '../../linked-data/models/dgt-ld.model';

export interface DGTDataInterface {
    category: DGTLD;
    values: DGTDataValue[];
    valueUpdated: EventEmitter<{ value: DGTDataValue, newObject: any }>;
    submit: EventEmitter<any>;
}
