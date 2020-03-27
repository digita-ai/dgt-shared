import { Observable } from 'rxjs';
import { DGTLoggerService, DGTHttpService } from '@digita/dgt-shared-utils';
import { Injectable } from '@angular/core';
import { DGTExchange, DGTJustification, DGTLDResponse, DGTLDTriple, DGTSource, DGTConnection } from '@digita/dgt-shared-data';
import { tap, map } from 'rxjs/operators';
import { Parser, N3Parser, Quad } from 'n3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class DGTLDService {
    private parser: N3Parser<Quad> = new Parser();

    constructor(private logger: DGTLoggerService, private http: DGTHttpService) {
    }

    public query(webId: string, accessToken: string, exchange: DGTExchange, justification: DGTJustification, source: DGTSource<any>, connection: DGTConnection<any>): Observable<DGTLDResponse> {
        this.logger.debug(DGTLDService.name, 'Starting to query linked data service', { endpoint: webId, exchange, justification });

        return this.http.get<string>(webId, {
            Authorization: 'Bearer ' + accessToken
        }, true)
            .pipe(
                tap(data => this.logger.debug(DGTLDService.name, 'Received response from connection', { data })),
                map(data => this.parse(data.data, webId, exchange, source, connection)),
                tap(data => this.logger.debug(DGTLDService.name, 'Parsed values', { data })),
                map(values => ({
                    data: values
                }))
            );
    }

    private parse(response: string, webId: string, exchange: DGTExchange, source: DGTSource<any>, connection: DGTConnection<any>): DGTLDTriple[] {
        let res: DGTLDTriple[] = null;

        const quads = this.parser.parse(response);
        this.logger.debug(DGTLDService.name, 'Parsed quads', { quads });

        if (quads) {
            this.logger.debug(DGTLDService.name, 'Starting to convert quads to values', { quads, webId });
            res = quads.map(quad => this.convert(quad, exchange, source, connection));
            res = res.map(value => ({ ...value, subject: value.subject.value === '#me' ? { value: webId } : value.subject }));
            //res = this.resolve(res);
            res = this.clean(res);
        }

        return res;
    }

    private convert(quad: Quad, exchange: DGTExchange, source: DGTSource<any>, connection: DGTConnection<any>): DGTLDTriple {
        const predicateSplit = quad.predicate.value.split('#');

        return {
            id: uuid(),
            exchange: exchange ? exchange.id : null,
            connection: connection ? connection.id : null,
            predicate: {
                name: predicateSplit && predicateSplit.length === 2 ? predicateSplit[1] : null,
                namespace: predicateSplit && predicateSplit.length === 2 ? predicateSplit[0] + '#' : null,
            },
            subject: quad.subject.value ? { value: quad.subject.value } : { value: connection.subject },
            object: { value: quad.object.value },
            originalValue: { value: quad.object.value },
            source: source ? source.id : null
        };
    }

    private resolve(values: DGTLDTriple[]): DGTLDTriple[] {
        // const variables = values.filter(
        //     value => value.field.namespace === 'http://www.w3.org/2006/vcard/ns#'
        //         && value.field.name === 'value'
        // );

        return values.map(value => {
            const updatedValue = value;

            if (value && (value.object.value as string).startsWith('#')) {
                const foundVariable = values.find(variable => variable.subject === value.object.value);

                if (foundVariable) {
                    updatedValue.object.value = foundVariable.object.value;
                }
            }

            return updatedValue;
        });
    }

    private clean(values: DGTLDTriple[]): DGTLDTriple[] {
        return values.map(value => {
            const updatedValue = value;
            const stringValue = (value.object.value as string);

            if (value && stringValue.startsWith('undefined/')) {
                const stringValueSplit = stringValue.split('undefined/')[1];
                const stringSubjectBase = value.subject.value.split('/profile/card#me')[0];

                updatedValue.object.value = stringSubjectBase + '/' + stringValueSplit;
            }

            return updatedValue;
        });
    }
}
