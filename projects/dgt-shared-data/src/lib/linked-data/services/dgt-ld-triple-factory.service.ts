
import { DGTLoggerService, DGTErrorArgument, DGTParameterCheckerService, DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { DGTSource } from '../../source/models/dgt-source.model';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTLDTriple } from '../models/dgt-ld-triple.model';
import { DGTLDTermType } from '../models/dgt-ld-term-type.model';
import { DGTLDNode } from '../models/dgt-ld-node.model';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';
import { v4 as uuid } from 'uuid';
import { Quad, Parser } from 'n3';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';

@DGTInjectable()
export class DGTLDTripleFactoryService {
    private parser: Parser<Quad> = new Parser();

    constructor(private logger: DGTLoggerService) { }

    public createFromString(response: string, documentUri: string, exchange: DGTExchange, source: DGTSource<any>, connection: DGTConnection<any>): DGTLDTriple[] {
        if (!response) {
            throw new DGTErrorArgument('Argument response should be set.', response);
        }

        if (!documentUri) {
            throw new DGTErrorArgument('Argument documentUri should be set.', documentUri);
        }

        if (!source) {
            throw new DGTErrorArgument('Argument source should be set.', source);
        }

        if (!connection) {
            throw new DGTErrorArgument('Argument connection should be set.', connection);
        }

        let res: DGTLDTriple[] = [];

        try {
            const quads = this.parser.parse(response);
            this.logger.debug(DGTLDTripleFactoryService.name, 'Parsed quads', { quads });

            res = this.createFromQuads(quads, documentUri, exchange, source, connection);
        } catch (err) {
            this.logger.error(DGTLDTripleFactoryService.name, 'Caught exception', { response, error: err })
        }

        return res;
    }

    public createFromQuads(quads: Quad[], documentUri: string, exchange: DGTExchange, source: DGTSource<any>, connection: DGTConnection<any>): DGTLDTriple[] {
        if (!quads) {
            throw new DGTErrorArgument('Argument quads should be set.', quads);
        }

        let res: DGTLDTriple[] = null;

        this.logger.debug(DGTLDTripleFactoryService.name, 'Starting to convert quads to values', { quads, documentUri });
        res = quads.map(quad => this.convertOne(documentUri, quad, exchange, source, connection));
        
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

        const subject = quad && quad.subject ? this.convertOneSubject(documentUri, quad, connection) : null;
        const object = quad && quad.object ? this.convertOneObject(documentUri, quad) : null;

        return {
            id: uuid(),
            exchange: exchange ? exchange.id : null,
            connection: connection ? connection.id : null,
            predicate: quad.predicate.value,
            subject,
            object,
            originalValue: object,
            source: source ? source.id : null
        };
    }

    private convertOneSubject(documentUri: string, quad: Quad, connection: DGTConnectionSolid): DGTLDNode {
        let subject: DGTLDNode = { value: quad.subject.value, termType: DGTLDTermType.REFERENCE };
        if (subject && subject.value && subject.value.startsWith('#me')) {

            subject = {
                value: `${documentUri}`,
                termType: DGTLDTermType.REFERENCE
            };
        } else if (subject && subject.value && subject.value.startsWith('#')) {
            subject = {
                value: `${documentUri.split('#')[0]}#${quad.subject.value.split('#')[1]}`,
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
                // here, the object is a reference to another triple
                res = {
                    value: documentUri.split('#')[0] + quad.object.value,
                    termType: DGTLDTermType.REFERENCE
                };
            } else if (quad.object.value.startsWith('undefined/')) {
                // here, the object is a relative reference to a file
                // BUT
                // n3 parser wrongly interprets relative references
                // in turtle, </events/lemonade3.ttl>
                // is parsed to 'undefined/events/lemonade3.ttl'
                // new versions of N3 might mix this issue, 
                res = {
                    // the origin of an url: [[https://www.youtube.com]]/watch?v=y8kEiL81_R4
                    // to this, add the relative path
                    value: new URL(documentUri).origin + quad.object.value.replace('undefined', ''),
                    termType: DGTLDTermType.REFERENCE
                }
            } else {
                // here, the object is an absolute reference
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