
import { DGTDataValue } from './data-value.model';
import { EventEmitter } from '@angular/core';
import { DGTCategory } from '../../linked-data/models/dgt-category.model';

export interface DGTDataInterface {
    category: DGTCategory;
    values: DGTDataValue[];
    valueUpdated: EventEmitter<{ value: DGTDataValue, newObject: any }>;
    submit: EventEmitter<any>;
}
