import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import _ from 'lodash';
import { Generator, Update, Triple, Term } from 'sparqljs';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';

/** Transforms linked data to trustedapps, and the other way around. */
@DGTInjectable()
export class DGTSparqlQueryService {

    constructor(
        private logger: DGTLoggerService,
    ) { }

    public generateSparqlUpdate(
        updatedEntities: DGTLDResource[],
        updateType: 'insert' | 'delete' | 'insertdelete',
        originalEntities?: DGTLDResource[]
    ): string {
        if (!updatedEntities) {
            throw new DGTErrorArgument(
                'updatedEntities should be set.',
                updatedEntities
            );
        }
        if (!updateType) {
            throw new DGTErrorArgument('updateType should be set.', updateType);
        }
        if (updateType === 'insertdelete' && !originalEntities) {
            throw new DGTErrorArgument(
                'originalEntities should be set.',
                originalEntities
            );
        }

        this.logger.debug(
            DGTSparqlQueryService.name,
            'Starting to generate SparQL for update',
            { updatedEntities }
        );

        const updatedTriples: DGTLDTriple[] = _.flatten(
            updatedEntities.map((entity) => entity.triples)
        );

        this.logger.debug(
            DGTSparqlQueryService.name,
            'Transformed updatedEntities to triples',
            { updatedTriples, updatedEntities }
        );

        const insertTriples: Triple[] = this.convertToTriples(updatedTriples);

        let deleteTriples: Triple[];
        if (updateType === 'insertdelete') {
            const originalTriples: DGTLDTriple[] = _.flatten(
                originalEntities.map((entity) => entity.triples)
            );
            this.logger.debug(
                DGTSparqlQueryService.name,
                'Transformed originalEntities to triples',
                { originalTriples, originalEntities }
            );
            deleteTriples = this.convertToTriples(originalTriples);
        }

        this.logger.debug(DGTSparqlQueryService.name, 'Parsed triples.', {
            insertTriples,
            deleteTriples,
        });

        let query: Update = null;

        if (updateType === 'delete') {
            query = {
                type: 'update',
                prefixes: {},
                updates: [
                    {
                        updateType,
                        delete: [{ type: 'bgp', triples: insertTriples }],
                    },
                ],
            };
        } else if (updateType === 'insert') {
            query = {
                type: 'update',
                prefixes: {},
                updates: [
                    {
                        updateType,
                        insert: [{ type: 'bgp', triples: insertTriples }],
                    },
                ],
            };
        } else if (updateType === 'insertdelete') {
            query = {
                type: 'update',
                prefixes: {},
                updates: [
                    {
                        updateType,
                        insert: [{ type: 'bgp', triples: insertTriples }],
                        delete: [{ type: 'bgp', triples: deleteTriples }],
                        where: [{ type: 'bgp', triples: deleteTriples }],
                    },
                ],
            };
        }

        this.logger.debug(DGTSparqlQueryService.name, 'Created query object.', {
            query,
            updatedEntities,
            insertTriples,
            deleteTriples,
        });

        const generator = new Generator();
        const body = generator.stringify(query);

        this.logger.debug(DGTSparqlQueryService.name, 'Created query string.', {
            body,
            query,
        });

        return body;
    }

    public convertToTriples(triples: DGTLDTriple[]): Triple[] {
        return triples.map((triple: DGTLDTriple) => {
            let object: Term = `${triple.object.value}` as Term;

            if (triple.object.termType === DGTLDTermType.LITERAL) {
                object = `\"${triple.object.value}\"^^${triple.object.dataType}` as Term;
            }

            return {
                subject: triple.subject.value as Term,
                predicate: triple.predicate as Term,
                object,
            };
        });
    }
}
