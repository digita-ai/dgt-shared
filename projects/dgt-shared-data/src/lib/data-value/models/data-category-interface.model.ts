
import { EventEmitter } from '@angular/core';
import { DGTCategory } from '../../categories/models/dgt-category.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

export interface DGTDataInterface {
    category: DGTCategory;
    values: DGTLDResource[];
    valueUpdated: EventEmitter<{ value: DGTLDResource, newObject: any }>;
    submit: EventEmitter<any>;
}
