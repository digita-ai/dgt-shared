import { Observable } from 'rxjs';
import { DGTLoggerService } from '@digita/dgt-shared-utils';
import * as rdf from 'rdflib';
import { Injectable } from '@angular/core';
import { DGTExchange, DGTJustification, DGTSource, DGTLDResponse, DGTLDValue, DGTLDField } from '@digita/dgt-shared-data';

@Injectable()
export class DGTLDService {
    private store: rdf.IndexedFormula;
    private fetcher: rdf.Fetcher;

    constructor(private logger: DGTLoggerService) {
        this.store = rdf.graph();

        const fetcherOptions = {};
        this.fetcher = new rdf.Fetcher(this.store, fetcherOptions);
    }

    public query(
        webId: string,
        exchange: DGTExchange,
        justification: DGTJustification
    ): Observable<DGTLDResponse> {
        return new Observable<DGTLDResponse>((subscriber) => {
            this.logger.debug(DGTLDService.name, 'Starting to query data', { webId });

            this.fetcher.nowOrWhenFetched(webId,
                (ok, body, xhr) => {
                    this.logger.debug(DGTLDService.name, 'Load finished');

                    this.parse(webId, this.store, exchange, justification)
                        .subscribe(data => {
                            this.logger.debug(DGTLDService.name, 'Parsed data', data);
                            subscriber.next(({ data }));
                            subscriber.complete();
                        },
                        );
                });
        });

    }

    private parse(
        webId: string,
        store: rdf.IndexedFormula,
        exchange: DGTExchange,
        justification: DGTJustification,
    ): Observable<DGTLDValue[]> {
        return new Observable<DGTLDValue[]>((subscriber) => {
            let res: DGTLDValue[] = [];

            if (justification && justification.fields) {
                res = justification.fields
                    .map((field) => this.getLinkedValue(webId, store, field, exchange))
                    .filter(value => value.value !== null);
            }

            subscriber.next(res);
            subscriber.complete();
        });
    }

    private getLinkedValue(
        webId: string,
        store: rdf.IndexedFormula,
        field: DGTLDField,
        exchange: DGTExchange
    ): DGTLDValue {
        const res: DGTLDValue = {
            exchange: exchange.id,
            field,
            value: null,
            subject: exchange.subject
        };

        const namespace = rdf.Namespace(field.namespace);

        const node = store.any(rdf.sym(webId), namespace(field.name));

        if (node) {
            const nodeValue = node.value;
            res.value = nodeValue;

            if (nodeValue && this.isValidURL(nodeValue)) {
                res.value = store.any(rdf.sym(nodeValue), namespace('value')).value;
            }
        }

        // if (res.value !== null && res.value !== undefined && (typeof res.value === 'string' || res.value instanceof String)) {
        //     res.value = res.value.split('mailto:').length > 0 ? res.value.split('mailto:')[1] : res.value;
        //     res.value = res.value.split('tel:').length > 0 ? res.value.split('tel:')[1] : res.value;
        // }

        return res;
    }

    private isValidURL(str): boolean {
        const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return !!pattern.test(str);
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
