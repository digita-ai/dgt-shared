import {DGTSourceType} from './dgt-source-type.model';
import { DGTEntity } from '@digita/dgt-shared-utils';

export interface DGTSource extends DGTEntity {
    subject: string;
    type: DGTSourceType;
    uri: string;
}
