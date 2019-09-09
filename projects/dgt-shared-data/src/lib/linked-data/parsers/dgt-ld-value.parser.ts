import { DGTLDParser } from '../models/dgt-ld-parser.model';
import * as rdf from 'rdflib';
import { Observable } from 'rxjs';
import { DGTLDValue } from '../models/dgt-ld-value.model';
import { DGTJustification } from '../../justification/models/dgt-justification.model';
import { DGTSource } from '../../source/models/dgt-source.model';
import { DGTLDField } from '../models/dgt-ld-field.model';
import { DGTExchange } from '../../subject/models/dgt-subject-exchange.model';

export class DGTLDValueParser implements DGTLDParser<DGTLDValue[]> {
    constructor(private exchange: DGTExchange, private justification: DGTJustification, private source: DGTSource) { }

    public parse(webId: string, store: rdf.IndexedFormula): Observable<DGTLDValue[]> {
        return new Observable<DGTLDValue[]>((subscriber) => {
            let res: DGTLDValue[] = [];

            if (this.justification && this.justification.fields) {
                res = this.justification.fields
                    .map((field) => this.getLinkedValue(webId, store, field, this.justification, this.source, this.exchange))
                    .filter(value => value.value !== null);
            }

            subscriber.next(res);
            subscriber.complete();
        });
    }

    private getLinkedValue(webId: string, store: rdf.IndexedFormula, field: DGTLDField, justification: DGTJustification, source: DGTSource, exchange: DGTExchange): DGTLDValue {
        const res: DGTLDValue = {
            exchange: exchange.id,
            field,
            justification: justification.id,
            source: source.id,
            subject: source.subject,
            value: null,
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
}
