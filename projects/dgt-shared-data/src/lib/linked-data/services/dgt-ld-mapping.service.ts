import { DGTLDValue } from '../models/dgt-ld-value.model';
import { DGTLDMapping } from '../models/dgt-ld-mapping.model';
import { Injectable } from '@angular/core';

@Injectable()
export class DGTLDMappingService {
    public map(values: DGTLDValue[], mappings: DGTLDMapping[]): DGTLDValue[] {
        const res: DGTLDValue[] = [];

        if (mappings && values) {
            values.forEach(value => {
                const updatedValue = value;

                const toMapping = mappings
                    .find(mapping => mapping.from.namespace === value.field.namespace && mapping.from.name === value.field.name);

                if (toMapping) {
                    updatedValue.field = toMapping.to;
                }

                res.push(updatedValue);
            });
        }

        return res;
    }
}
