import { Injectable } from '@angular/core';
import { DGTSparqlDataset } from '../models/dgt-sparql-dataset.model';

@Injectable()
export abstract class DGTSparqlService<T extends DGTSparqlDataset> {
    
}