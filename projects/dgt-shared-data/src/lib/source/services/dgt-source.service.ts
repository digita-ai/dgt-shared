import { DGTSource } from '../models/dgt-source.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DGTLoggerService } from '@digita/dgt-shared-utils';
import { DGTLDService } from '../../linked-data/services/dgt-ld.service';
import { DGTJustification } from '../../justification/models/dgt-justification.model';
import { DGTLDValue } from '../../linked-data/models/dgt-ld-value.model';
import { DGTLDMapping } from '../../linked-data/models/dgt-ld-mapping.model';
import { DGTLDMappingService } from '../../linked-data/services/dgt-ld-mapping.service';
import { DGTExchange } from '../../subject/models/dgt-subject-exchange.model';
import { Injectable } from '@angular/core';
import { DGTSourceConnector } from '../models/dgt-source-connector.model';
import { DGTSourceType } from '../models/dgt-source-type.model';
import { DGTSourceSolidConnector } from '../connectors/dgt-source-solid.connector';
import { DGTSourceMSSQLConnector } from '../connectors/dgt-source-mssql.connector';

@Injectable()
export class DGTSourceService {

    constructor(private linked: DGTLDService, private mapping: DGTLDMappingService, private logger: DGTLoggerService) { }

    public get(exchange: DGTExchange, source: DGTSource, justification: DGTJustification, mappings: DGTLDMapping[])
        : Observable<DGTLDValue[]> {
        this.logger.debug(DGTSourceService.name, 'Getting source', source);

        let connector: DGTSourceConnector = null;

        if (source.type === DGTSourceType.SOLID) {
            connector = new DGTSourceSolidConnector(this.linked);
        } else if (source.type === DGTSourceType.MSSQL) {
            connector = new DGTSourceMSSQLConnector();
        }

        return connector.query(source.uri, exchange, justification, source)
            .pipe(
                map((response) => this.mapping.map(response.data, mappings)),
            );
    }
}
