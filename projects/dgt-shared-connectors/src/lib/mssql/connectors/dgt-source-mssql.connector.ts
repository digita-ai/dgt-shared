import { Observable } from 'rxjs';
import * as sql from 'mssql';
import { DGTLDResponse, DGTExchange, DGTJustification, DGTSource, DGTSourceConnector } from '@digita/dgt-shared-data';

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
