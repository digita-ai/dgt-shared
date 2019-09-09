import { Observable } from 'rxjs';
import { DGTLDResponse } from '../models/dgt-ld-response.model';
import { DGTLoggerService } from '@digita/dgt-shared-utils';
import { Injectable } from '@nestjs/common';
import * as rdf from 'rdflib';
import { DGTLDParser } from '../models/dgt-ld-parser.model';

@Injectable()
export class DGTLDService {
    private store: rdf.IndexedFormula;
    private fetcher: rdf.Fetcher;

    constructor(private logger: DGTLoggerService) {
        this.store = rdf.graph();

        const fetcherOptions = {};
        this.fetcher = new rdf.Fetcher(this.store, fetcherOptions);
    }

    public query<T>(webId: string, parser: DGTLDParser<T>): Observable<DGTLDResponse<T>> {
        return new Observable<DGTLDResponse<T>>((subscriber) => {
            this.logger.debug(DGTLDService.name, 'Starting to query data', { webId, parser });

            this.fetcher.load(webId).finally(
                () => {
                    this.logger.debug(DGTLDService.name, 'Load finished');

                    parser.parse(webId, this.store)
                        .subscribe(data => {
                                this.logger.debug(DGTLDService.name, 'Parsed data', data);
                                subscriber.next(({ data }));
                                subscriber.complete();
                            },
                        );
                },
            );
        });

    }

    // public query(webId: string, query: string): Observable<DGTLinkedDataResponse<any>> {
    //     return new Observable((subscriber) => {
    //         // const url = encodeURI(this.endpoint);

    //         this.logger.debug(DGTLinkedDataService.name, 'Starting to query data', { webId, query });

    //         try {
    //             from(this.fetcher.load(webId))
    //             // post(webId, { form: 'query=' + query }, (error, response, body) => {
    //             post(webId, {}, (error, response, body) => {
    //                 this.logger.debug(DGTLinkedDataService.name, 'Received response, starting to convert', { error, response, body });

    //                 this.parser.fromSPARQLJSONToTurtle(webId, JSON.parse(body))
    //                     .subscribe((data) => {
    //                         subscriber.next({ data });
    //                         subscriber.complete();
    //                     });
    //             });
    //         } catch (e) {
    //             this.logger.debug(DGTLinkedDataService.name, 'Something went wrong', e);
    //             subscriber.error('Something went wrong: ' + e);
    //             subscriber.complete();
    //         }
    //     });
    // }

    // public update(query: string): Observable<DGTLinkedDataResponse<any>> {
    //     return new Observable((subscriber) => {
    //         const url = encodeURI(this.endpoint);

    //         this.logger.debug(DGTLinkedDataService.name, 'Starting to update data', { url, query });

    //         try {
    //             post(url, { form: 'update=' + query }, (error, response, body) => {
    //                 this.logger.debug(DGTLinkedDataService.name, 'Received response', { error, response, body });

    //                 subscriber.next({ data: body });
    //                 subscriber.complete();
    //             });
    //         } catch (e) {
    //             this.logger.debug(DGTLinkedDataService.name, 'Something went wrong', e);
    //             subscriber.error('Something went wrong: ' + e);
    //             subscriber.complete();
    //         }
    //     });
    // }
}
