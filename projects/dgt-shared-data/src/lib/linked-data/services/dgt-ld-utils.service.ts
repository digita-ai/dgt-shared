import { DGTLDPredicate } from '@digita/dgt-shared-data/public-api';
import { Injectable } from '@angular/core';

@Injectable()
export class DGTLDUtils {
    public same(predicate1: DGTLDPredicate, predicate2: DGTLDPredicate): boolean {
        return predicate1 && predicate2 && predicate1.name === predicate2.name && predicate1.namespace === predicate2.namespace;
    }
}