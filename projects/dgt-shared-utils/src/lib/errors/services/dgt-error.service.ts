
import { DGTInjectable } from '../../decorators/dgt-injectable';
import { DGTLoggerService } from '../../logging/services/dgt-logger.service';

@DGTInjectable()
export class DGTErrorService {

  constructor(
    private logger: DGTLoggerService,
  ) { }

  public handle(typeName: string, error: Error, caught?: any) {
    this.logger.error(typeName, 'An error has occurred.', error, caught);
  }

}
