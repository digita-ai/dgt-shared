import { Injectable } from '@angular/core';

@Injectable()
export class DGTLDUtils {
    public same(predicate1: string, predicate2: string): boolean {
        return predicate1 && predicate2 && predicate1 === predicate2;
    }
}
