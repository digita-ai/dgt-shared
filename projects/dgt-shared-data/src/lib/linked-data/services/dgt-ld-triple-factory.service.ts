import { Injectable } from '@angular/core';
import { DGTLoggerService, DGTErrorArgument } from '@digita/dgt-shared-utils';
import { DGTExchange } from '../../subject/models/dgt-subject-exchange.model';
import { DGTSource } from '../../source/models/dgt-source.model';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTLDTriple } from '../models/dgt-ld-triple.model';
import { DGTLDTermType } from '../models/dgt-ld-term-type.model';
import { DGTLDNode } from '../models/dgt-ld-node.model';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';
import { v4 as uuid } from 'uuid';
import { Quad, Parser } from 'n3';

@Injectable()
export class DGTLDTripleFactoryService {
    private parser: Parser<Quad> = new Parser();

    constructor(private logger: DGTLoggerService) { }

    public createFromString(response: string, documentUri: string, exchange: DGTExchange, source: DGTSource<any>, connection: DGTConnection<any>): DGTLDTriple[] {
        let res: DGTLDTriple[] = null;

        const quads = this.parser.parse(response);
        this.logger.debug(DGTLDTripleFactoryService.name, 'Parsed quads', { quads });

        return this.createFromQuads(quads, documentUri, exchange, source, connection);
    }

    public createFromQuads(quads: Quad[], documentUri: string, exchange: DGTExchange, source: DGTSource<any>, connection: DGTConnection<any>): DGTLDTriple[] {
        if (!quads) {
            throw new DGTErrorArgument('Argument quads should be set.', quads);
        }

        let res: DGTLDTriple[] = null;

        this.logger.debug(DGTLDTripleFactoryService.name, 'Starting to convert quads to values', { quads, documentUri });
        res = quads.map(quad => this.convertOne(documentUri, quad, exchange, source, connection));
        res = res.map(value => ({
            ...value, subject: value.subject && value.subject.value === '#me' ?
                value.subject : value.subject
            // { value: webId, type: DGTLDTermType.REFERENCE } : value.subject
        }));
        res = this.clean(res);

        return res;
    }

    private convertOne(documentUri: string, quad: Quad, exchange: DGTExchange, source: DGTSource<any>, connection: DGTConnection<any>): DGTLDTriple {
        if (!quad) {
            throw new DGTErrorArgument('Argument quad should be set.', quad);
        }

        if (!quad.predicate) {
            throw new DGTErrorArgument('Argument quad.predicate should be set.', quad.predicate);
        }

        const predicateSplit = quad.predicate.value.split('#');

        const subject = quad && quad.subject ? this.convertOneSubject(documentUri, quad, connection) : null;
        const object = quad && quad.object ? this.convertOneObject(documentUri, quad) : null;

        return {
            id: uuid(),
            exchange: exchange ? exchange.id : null,
            connection: connection ? connection.id : null,
            predicate: {
                name: predicateSplit && predicateSplit.length === 2 ? predicateSplit[1] : null,
                namespace: predicateSplit && predicateSplit.length === 2 ? predicateSplit[0] + '#' : null,
            },
            subject,
            object,
            originalValue: object,
            source: source ? source.id : null
        };
    }

    private convertOneSubject(documentUri: string, quad: Quad, connection: DGTConnectionSolid): DGTLDNode {
        let subject: DGTLDNode = { value: quad.subject.value, termType: DGTLDTermType.REFERENCE };
        if (subject && subject.value && subject.value.startsWith('#me')) {
            // const me = connection.configuration.webId.split('/profile/card#me')[0];

            subject = {
                value: `${documentUri}`,
                termType: DGTLDTermType.REFERENCE
            };
        } else if (subject && subject.value && subject.value.startsWith('#')) {
            subject = {
                value: `${documentUri}#${quad.subject.value.split('#')[1]}`,
                termType: DGTLDTermType.REFERENCE
            };
        }

        return subject;
    }

    private convertOneObject(documentUri: string, quad: Quad): DGTLDNode {
        let res = null;

        if (quad.object.termType === 'Literal') {
            res = {
                dataType: quad.object.datatypeString,
                value: quad.object.value,
                termType: DGTLDTermType.LITERAL
            };
        } else {
            if (quad.object.value.startsWith('#')) {
                res = {
                    value: documentUri + quad.object.value,
                    termType: DGTLDTermType.REFERENCE
                };
            } else {
                res = {
                    value: quad.object.value,
                    termType: DGTLDTermType.REFERENCE
                };
            }
        }


        return res;
    }

    private clean(values: DGTLDTriple[]): DGTLDTriple[] {
        return values
            .map(value => {
                const updatedValue = value;

                if (value && value.object && value.object.value) {
                    const stringValue = (value.object.value as string);

                    if (stringValue.startsWith('undefined/')) {
                        const stringValueSplit = stringValue.split('undefined/')[1];
                        const stringSubjectBase = value.subject.value.split('/profile/card#me')[0];

                        updatedValue.object.value = stringSubjectBase + '/' + stringValueSplit;
                    }
                }

                return updatedValue;
            });
    }
}