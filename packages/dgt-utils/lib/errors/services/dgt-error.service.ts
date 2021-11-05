
import { DGTLoggerService } from '../../logging/services/dgt-logger.service';

export class DGTErrorService {

  constructor(
    private logger: DGTLoggerService,
  ) { }

  handle(typeName: string, error: Error, caught?: any) {

    this.logger.error(typeName, 'An error has occurred.', error, caught);

  }

}
