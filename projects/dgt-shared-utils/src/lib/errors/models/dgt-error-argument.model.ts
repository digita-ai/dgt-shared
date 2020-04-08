import { DGTError } from './dgt-error.model';

export class DGTErrorArgument extends DGTError {
    public readonly name = DGTErrorArgument.name;

    constructor(message: string, public value: any) {
        super(message, null);

        Object.setPrototypeOf(this, DGTErrorArgument.prototype);
    }
}
