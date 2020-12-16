import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTSparqlDatasetType } from './dgt-sparql-dataset-type.model';
import { DGTSparqlDataset } from './dgt-sparql-dataset.model';

export interface DGTSparqlDatasetMemory extends DGTSparqlDataset {
    type: DGTSparqlDatasetType.MEMORY;
    triples: DGTLDTriple[];
}
