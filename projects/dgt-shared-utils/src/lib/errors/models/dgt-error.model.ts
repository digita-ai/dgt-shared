export class DGTError extends Error {
    public readonly name = DGTError.name;

    constructor(messsage: string, public cause: Error) {
        super(messsage);

        Object.setPrototypeOf(this, DGTError.prototype);
    }
}
