import { Injectable } from '@angular/core';
import { DGTLDPredicate } from '../models/dgt-ld-predicate.model';

@Injectable()
export class DGTLDUtils {
    public same(predicate1: DGTLDPredicate, predicate2: DGTLDPredicate): boolean {
        return predicate1 && predicate2 && predicate1.name === predicate2.name && predicate1.namespace === predicate2.namespace;
    }
}