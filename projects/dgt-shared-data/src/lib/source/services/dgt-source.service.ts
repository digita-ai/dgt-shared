import { DGTSource } from '../models/dgt-source.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DGTLoggerService, DGTMap } from '@digita/dgt-shared-utils';
import { DGTJustification } from '../../justification/models/dgt-justification.model';
import { DGTLDValue } from '../../linked-data/models/dgt-ld-value.model';
import { DGTExchange } from '../../subject/models/dgt-subject-exchange.model';
import { Injectable } from '@angular/core';
import { DGTSourceConnector } from '../models/dgt-source-connector.model';
import { DGTSourceType } from '../models/dgt-source-type.model';
import { DGTProvider } from '../../provider/models/dgt-provider.model';

@Injectable()
export class DGTSourceService {

    private connectors: DGTMap<DGTSourceType, DGTSourceConnector<any, any>>;

    constructor(private logger: DGTLoggerService) { }

    public get(exchange: DGTExchange, provider: DGTProvider<any>, source: DGTSource<any>, justification: DGTJustification)
        : Observable<DGTLDValue[]> {
        this.logger.debug(DGTSourceService.name, 'Getting source', source);

        let connector: DGTSourceConnector<any, any> = null;

        if (this.connectors) {
            connector = this.connectors.get(source.type);
        }

        return connector.query(justification, exchange, provider, source)
            .pipe(
                map((response) => response.data),
            );
    }

    public register(sourceType: DGTSourceType, connector: DGTSourceConnector<any, any>) {
        if (!this.connectors) {
            this.connectors = new DGTMap<DGTSourceType, DGTSourceConnector<any, any>>();
        }

        this.connectors.set(sourceType, connector);
    }
}
