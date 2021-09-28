import { Injectable } from '@angular/core';
import { DGTOriginService } from './dgt-origin.service';

@Injectable()
export class DGTOriginMockService extends DGTOriginService {

  constructor(private origin: string) {

    super();

  }

  get(): string {

    return this.origin;

  }

}
