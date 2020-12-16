import { DGTConnectionSolidConfiguration } from './dgt-connection-solid-configuration.model';
import { DGTConnectionType } from './dgt-connection-type.model';
import { DGTConnection } from './dgt-connection.model';

export interface DGTConnectionSolid extends DGTConnection<DGTConnectionSolidConfiguration> {
    type: DGTConnectionType.SOLID;
 }
