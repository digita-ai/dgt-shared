
import { EventEmitter } from '@angular/core';
import { DGTCategory } from '../../categories/models/dgt-category.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

export interface DGTDataInterface {
    category: DGTCategory;
    resources: DGTLDResource[];
    resourceUpdated: EventEmitter<{ resource: DGTLDResource, newObject: any }>;
    submit: EventEmitter<any>;
}
