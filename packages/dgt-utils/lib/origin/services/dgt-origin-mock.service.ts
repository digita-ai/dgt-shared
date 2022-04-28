import { getLoggerFor, Logger } from '@digita-ai/handlersjs-logging';
import { DGTOriginService } from './dgt-origin.service';

export class DGTOriginMockService extends DGTOriginService {

  private logger: Logger = getLoggerFor(this, 5, 5);

  constructor(private origin: string) {

    super();

  }

  get(): string {

    this.logger.info('Getting origin', this.origin);

    return this.origin;

  }

}
