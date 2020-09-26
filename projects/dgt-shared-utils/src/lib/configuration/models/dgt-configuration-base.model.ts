export interface DGTConfigurationBase {
    baseURI: string;
    typeRegistrations?: {
        [key: string]: string;
    };
}
