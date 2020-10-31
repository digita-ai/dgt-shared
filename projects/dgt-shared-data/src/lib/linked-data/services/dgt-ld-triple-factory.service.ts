import { DGTLoggerService, DGTErrorArgument, DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { DGTLDTriple } from '../models/dgt-ld-triple.model';
import { DGTLDTermType } from '../models/dgt-ld-term-type.model';
import { DGTLDNode } from '../models/dgt-ld-node.model';
import { v4 as uuid } from 'uuid';
import { Quad, Parser } from 'n3';

@DGTInjectable()
export class DGTLDTripleFactoryService {
    private parser: Parser<Quad> = new Parser();

    constructor(private logger: DGTLoggerService) { }

    public createFromString(response: string, uri: string): DGTLDTriple[] {
        if (!response) {
            throw new DGTErrorArgument('Argument response should be set.', response);
        }

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        let res: DGTLDTriple[] = [];

        try {
            const quads = this.parser.parse(response);
            this.logger.debug(DGTLDTripleFactoryService.name, 'Parsed quads', { uri });

            res = this.createFromQuads(quads, uri);
        } catch (err) {
            this.logger.error(DGTLDTripleFactoryService.name, 'Caught exception', { response, error: err })
        }

        return res;
    }

    public createFromQuads(quads: Quad[], uri: string): DGTLDTriple[] {
        if (!quads) {
            throw new DGTErrorArgument('Argument quads should be set.', quads);
        }

        let res: DGTLDTriple[] = null;

        this.logger.debug(DGTLDTripleFactoryService.name, 'Starting to convert quads to values', { uri });
        res = quads.map(quad => this.convertOne(uri, quad));
        
        res = this.clean(res);

        return res;
    }

    private convertOne(uri: string, quad: Quad): DGTLDTriple {
        if (!quad) {
            throw new DGTErrorArgument('Argument quad should be set.', quad);
        }

        if (!quad.predicate) {
            throw new DGTErrorArgument('Argument quad.predicate should be set.', quad.predicate);
        }

        const subject = quad && quad.subject ? this.convertOneSubject(uri, quad) : null;
        const object = quad && quad.object ? this.convertOneObject(uri, quad) : null;

        return {
            id: uuid(),
            predicate: quad.predicate.value,
            subject,
            object,
        };
    }

    private convertOneSubject(uri: string, quad: Quad): DGTLDNode {
        let subject: DGTLDNode = { value: quad.subject.value, termType: DGTLDTermType.REFERENCE };
        if (subject && subject.value && subject.value.startsWith('#me')) {

            subject = {
                value: `${uri}`,
                termType: DGTLDTermType.REFERENCE
            };
        } else if (subject && subject.value && subject.value.startsWith('#')) {
            subject = {
                value: `${uri.split('#')[0]}#${quad.subject.value.split('#')[1]}`,
                termType: DGTLDTermType.REFERENCE
            };
        }

        return subject;
    }

    private convertOneObject(uri: string, quad: Quad): DGTLDNode {
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
                    value: uri.split('#')[0] + quad.object.value,
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
                    value: new URL(uri).origin + quad.object.value.replace('undefined', ''),
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