import { DGTSourceConnector } from '../models/dgt-source-connector.model';
import { DGTLDResponse } from '../../linked-data/models/dgt-ld-response.model';
import { DGTJustification } from '../../justification/models/dgt-justification.model';
import { DGTExchange } from '../../subject/models/dgt-subject-exchange.model';
import { Observable, from, of } from 'rxjs';
import { DGTSource } from '../models/dgt-source.model';
import * as sql from 'mssql';
import { switchMap, map } from 'rxjs/operators';

export class DGTSourceMSSQLConnector implements DGTSourceConnector {
    public query(
        webId: string,
        exchange: DGTExchange,
        justification: DGTJustification,
        source: DGTSource
    ): Observable<DGTLDResponse> {
        // const config = {
        //     user: '...',
        //     password: '...',
        //     server: 'localhost', // You can use 'localhost\\instance' to connect to named instance
        //     database: '...',

        //     options: {
        //         encrypt: false // Use this if you're on Windows Azure
        //     }
        // };

        // const pool = new sql.ConnectionPool(config);

        // return of({ pool, config })
        //     .pipe(
        //         switchMap(data => from(data.pool.connect())
        //             .pipe(map(newPool => data))
        //         ),
        //         switchMap(data => data.pool.request()
        //         .query()
        //         )
        //     );


        throw new Error();
    }
}
