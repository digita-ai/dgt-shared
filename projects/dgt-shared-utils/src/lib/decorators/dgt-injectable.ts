export enum DGTServiceType {
    NEST,
    ANGULAR
}

export function DGTInjectable() {
    try {
        return require('@angular/core').Injectable;
    } catch (e) {
        console.log(e);
    }
    //return type === DGTServiceType.ANGULAR ? AngularInjectable : NestInjectable;
}
