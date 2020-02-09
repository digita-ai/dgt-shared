import { Observable } from 'rxjs';
import { DGTLoggerService, DGTHttpService } from '@digita/dgt-shared-utils';
import { Injectable } from '@angular/core';
import { DGTExchange, DGTJustification, DGTLDResponse, DGTLDValue, DGTSource } from '@digita/dgt-shared-data';
import { tap, map } from 'rxjs/operators';
import { Parser, N3Parser, Quad } from 'n3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class DGTLDService {
    private parser: N3Parser<Quad> = new Parser();

    constructor(private logger: DGTLoggerService, private http: DGTHttpService) {
    }

    public query(webId: string, accessToken: string, exchange: DGTExchange, justification: DGTJustification, source: DGTSource<any>): Observable<DGTLDResponse> {
        this.logger.debug(DGTLDService.name, 'Starting to query linked data service', { endpoint: webId, exchange, justification });

        return this.http.get<string>(webId, {
            Authorization: 'Bearer ' + accessToken
        }, true)
            .pipe(
                tap(data => this.logger.debug(DGTLDService.name, 'Received response from provider', { data })),
                map(data => this.parse(data.data, webId, exchange, source)),
                tap(data => this.logger.debug(DGTLDService.name, 'Parsed values', { data })),
                map(values => ({
                    data: values
                }))
            );
    }

    private parse(response: string, webId: string, exchange: DGTExchange, source: DGTSource<any>): DGTLDValue[] {
        let quads = this.parser.parse(response);

        if (quads) {
            quads = quads.filter(quad => quad.subject.value === '#me');
        }

        return quads.map(quad => this.convert(quad, webId, exchange, source));
    }

    private convert(quad: Quad, webId: string, exchange: DGTExchange, source: DGTSource<any>): DGTLDValue {
        const predicateSplit = quad.predicate.value.split('#');

        return {
            id: uuid(),
            exchange: exchange ? exchange.id : null,
            field: {
                name: predicateSplit && predicateSplit.length === 2 ? predicateSplit[1] : null,
                namespace: predicateSplit && predicateSplit.length === 2 ? predicateSplit[0] + '#' : null,
            },
            subject: webId,
            value: quad.object.value,
            originalValue: quad.object.value,
            source: source ? source.id : null
        };
    }

    // public query(
    //     webId: string,
    //     exchange: DGTExchange,
    //     justification: DGTJustification
    // ): Observable<DGTLDResponse> {
    //     return new Observable<DGTLDResponse>((subscriber) => {
    //         this.logger.debug(DGTLDService.name, 'Starting to query data', { webId });

    //         this.fetcher.nowOrWhenFetched(webId,
    //             (ok, body, xhr) => {
    //                 this.logger.debug(DGTLDService.name, 'Load finished');

    //                 this.parse(webId, this.store, exchange, justification)
    //                     .subscribe(data => {
    //                         this.logger.debug(DGTLDService.name, 'Parsed data', data);
    //                         subscriber.next(({ data }));
    //                         subscriber.complete();
    //                     },
    //                     );
    //             });
    //     });

    // }

    // private parse(
    //     webId: string,
    //     store: rdf.IndexedFormula,
    //     exchange: DGTExchange,
    //     justification: DGTJustification,
    // ): Observable<DGTLDValue[]> {
    //     return new Observable<DGTLDValue[]>((subscriber) => {
    //         let res: DGTLDValue[] = [];

    //         if (justification && justification.fields) {
    //             res = justification.fields
    //                 .map((field) => this.getLinkedValue(webId, store, field, exchange))
    //                 .filter(value => value.value !== null);
    //         } else {

    //         }

    //         subscriber.next(res);
    //         subscriber.complete();
    //     });
    // }

    // // private getAllValues(store: rdf.IndexedFormula): DGTLDValue[] {
    // //     store.
    // // }

    // private getLinkedValue(
    //     webId: string,
    //     store: rdf.IndexedFormula,
    //     field: DGTLDField,
    //     exchange: DGTExchange
    // ): DGTLDValue {
    //     const res: DGTLDValue = {
    //         exchange: exchange.id,
    //         field,
    //         value: null,
    //         originalValue: null,
    //         source: exchange.source,
    //         subject: exchange.subject
    //     };

    //     const namespace = rdf.Namespace(field.namespace);

    //     const node = store.any(rdf.sym(webId), namespace(field.name));

    //     if (node) {
    //         const nodeValue = node.value;
    //         res.value = nodeValue;

    //         if (nodeValue && this.isValidURL(nodeValue)) {
    //             res.value = store.any(rdf.sym(nodeValue), namespace('value')).value;
    //         }

    //         res.originalValue = res.value;
    //     }

    //     // if (res.value !== null && res.value !== undefined && (typeof res.value === 'string' || res.value instanceof String)) {
    //     //     res.value = res.value.split('mailto:').length > 0 ? res.value.split('mailto:')[1] : res.value;
    //     //     res.value = res.value.split('tel:').length > 0 ? res.value.split('tel:')[1] : res.value;
    //     // }

    //     return res;
    // }

    // private isValidURL(str): boolean {
    //     const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    //         '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    //         '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    //         '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    //         '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    //         '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    //     return !!pattern.test(str);
    // }

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
