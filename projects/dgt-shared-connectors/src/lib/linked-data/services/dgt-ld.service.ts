import { Observable } from 'rxjs';
import { DGTLoggerService, DGTHttpService } from '@digita/dgt-shared-utils';
import { Injectable } from '@angular/core';
import { DGTExchange, DGTJustification, DGTLDResponse, DGTLDTriple, DGTSource, DGTConnection, DGTLDNode, DGTConnectionSolid, DGTLDNodeType } from '@digita/dgt-shared-data';
import { tap, map } from 'rxjs/operators';
import { Parser, N3Parser, Quad } from 'n3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class DGTLDService {
    private parser: N3Parser<Quad> = new Parser();

    constructor(private logger: DGTLoggerService, private http: DGTHttpService) {
    }

    public get(webId: string, exchange: DGTExchange, justification: DGTJustification, source: DGTSource<any>, connection: DGTConnection<any>): Observable<DGTLDResponse> {
        this.logger.debug(DGTLDService.name, 'Starting to query linked data service', { endpoint: webId, exchange, justification });

        return this.http.get<string>(webId, {
            Authorization: 'Bearer ' + connection.configuration.accessToken
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

    public delete(uri, triples: DGTLDTriple[], connection: DGTConnectionSolid): Observable<any> {

        // DELETE DATA {<https://wouteraj.solid.community/profile/card#me> <http://www.w3.org/2006/vcard/ns#hasTelephone> <https://wouteraj.solid.community/profile/card#id1579729497510>.
        //     <https://wouteraj.solid.community/profile/card#id1579729497510> <http://www.w3.org/2006/vcard/ns#value> <tel:0447444444>.
        //     };

        let body = '';

        body += 'DELETE DATA {';

        if (triples) {
            triples.forEach(triple => {
                if (triple.object.type === DGTLDNodeType.LITERAL) {
                    body += `<${triple.subject.value}> <${triple.predicate.namespace}${triple.predicate.name}> "${triple.object.value}" . `;
                } else if (triple.object.type === DGTLDNodeType.REFERENCE) {
                    body += `<${triple.subject.value}> <${triple.predicate.namespace}${triple.predicate.name}> <${triple.object.value}> . `;
                }
            });
        }

        body += '};';

        return this.http.patch(uri, body, {
            'Content-Type': 'application/sparql-update',
            Authorization: 'Bearer ' + connection.configuration.accessToken
        });
    }

    private parse(response: string, webId: string, exchange: DGTExchange, source: DGTSource<any>, connection: DGTConnection<any>): DGTLDTriple[] {
        let res: DGTLDTriple[] = null;

        const quads = this.parser.parse(response);
        this.logger.debug(DGTLDService.name, 'Parsed quads', { quads });

        if (quads) {
            this.logger.debug(DGTLDService.name, 'Starting to convert quads to values', { quads, webId });
            res = quads.map(quad => this.convert(webId, quad, exchange, source, connection));
            res = res.map(value => ({
                ...value, subject: value.subject.value === '#me' ?
                    { value: webId, type: DGTLDNodeType.REFERENCE } : value.subject
            }));
            res = this.clean(res);
        }

        return res;
    }

    private convert(webId: string, quad: Quad, exchange: DGTExchange, source: DGTSource<any>, connection: DGTConnection<any>): DGTLDTriple {
        const predicateSplit = quad.predicate.value.split('#');

        let subject: DGTLDNode = { value: quad.subject.value, type: DGTLDNodeType.REFERENCE };
        if (subject && subject.value && subject.value.startsWith('#me')) {
            const me = connection.configuration.webId.split('/profile/card#me')[0];

            subject = {
                value: `${webId}`,
                type: DGTLDNodeType.REFERENCE
            };
        } else if (subject && subject.value && subject.value.startsWith('#')) {
            subject = {
                value: `${webId}#${quad.subject.value.split('#')[1]}`,
                type: DGTLDNodeType.REFERENCE
            };
        }

        return {
            id: uuid(),
            exchange: exchange ? exchange.id : null,
            connection: connection ? connection.id : null,
            predicate: {
                name: predicateSplit && predicateSplit.length === 2 ? predicateSplit[1] : null,
                namespace: predicateSplit && predicateSplit.length === 2 ? predicateSplit[0] + '#' : null,
            },
            subject,
            object: {
                value: quad.object.value,
                type: quad.object.termType === 'Literal' ? DGTLDNodeType.LITERAL : DGTLDNodeType.REFERENCE
            },
            originalValue: {
                value: quad.object.value,
                type: quad.object.termType === 'Literal' ? DGTLDNodeType.LITERAL : DGTLDNodeType.REFERENCE
            },
            source: source ? source.id : null
        };
    }

    private clean(values: DGTLDTriple[]): DGTLDTriple[] {
        return values
            .map(value => {
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
