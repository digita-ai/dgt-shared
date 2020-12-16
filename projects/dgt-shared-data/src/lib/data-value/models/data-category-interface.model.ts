
import { EventEmitter } from '@angular/core';
import { DGTCategory } from '../../categories/models/dgt-category.model';
import { DGTDataValue } from './data-value.model';

export interface DGTDataInterface {
    category: DGTCategory;
    values: DGTDataValue[];
    valueUpdated: EventEmitter<{ value: DGTDataValue, newObject: any }>;
    submit: EventEmitter<any>;
}
