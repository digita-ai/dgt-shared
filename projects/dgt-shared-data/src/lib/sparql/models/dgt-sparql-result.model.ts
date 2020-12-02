export interface DGTSparqlResult {

    head: {
        vars: string[],
        link: string[],
    };

    results: {
        bindings: {
            [key: string]: {
                type: string,
                value: string,
            }
        }[],
    };

}
