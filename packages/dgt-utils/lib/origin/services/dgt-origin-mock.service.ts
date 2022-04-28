import { DGTOriginService } from './dgt-origin.service';

export class DGTOriginMockService extends DGTOriginService {

  constructor(private origin: string) {

    super();

  }

  get(): string {

    return this.origin;

  }

}
