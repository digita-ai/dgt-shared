import { DGTLoggerLevel } from '../../logging/models/dgt-logger-level.model';

export interface DGTConfigurationBase {
    baseURI: string;
    logger: {
        minimumLevel: DGTLoggerLevel,
    };
}
