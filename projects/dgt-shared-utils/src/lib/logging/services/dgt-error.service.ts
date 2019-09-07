import { Injectable } from '@angular/core';
import { DGTLoggerService } from './dgt-logger.service';

@Injectable()
export class DGTErrorService {

  constructor(
    private logger: DGTLoggerService
  ) { }

  public handle(typeName: string, error: Error, caught?: any) {
    this.logger.error(typeName, 'An error has occurred.', error, caught);
  }

}
