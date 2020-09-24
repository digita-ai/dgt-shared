export interface DGTConfigurationBase {
    baseURI: string;
    typeRegistrations?: {
        [key: string]: {
            location: string,
            forClass: string
        }
    };
}
