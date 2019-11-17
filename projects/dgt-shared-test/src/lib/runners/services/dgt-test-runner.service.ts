import { DGTTestConfiguration } from '../../configuration/models/dgt-test-configuration.model';

export abstract class DGTTestRunner {
    constructor(protected configuration: DGTTestConfiguration) { }
}
