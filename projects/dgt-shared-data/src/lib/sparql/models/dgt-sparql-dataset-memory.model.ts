import { DGTSparqlDataset } from './dgt-sparql-dataset.model';
import { DGTSparqlDatasetType } from './dgt-sparql-dataset-type.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';

export interface DGTSparqlDatasetMemory extends DGTSparqlDataset {
    type: DGTSparqlDatasetType.MEMORY;
    triples: DGTLDTriple[];
}