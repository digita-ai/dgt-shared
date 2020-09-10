export interface DGTSparqlResult {
    head: {
        vars: string[],
        links: string[],
    },
    results: {
        bindings: {
            [key: string]: {
                type: string,
                value: string,
            }
        }[],
    }
}