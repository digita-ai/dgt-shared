/** Used to store require object */
let injectableImport = null;

/**
 * This is a wrapper decorator that can be used in both Angular and nestjs projects
 * It will determine between Angular and nestjs' @DGTInjectable() decorator
 * So that services written in Angular projects can be used in nestjs projects and vice-versa
 */
export function DGTInjectable() {
    if (!injectableImport) {
        const displayDate: string = new Date().toLocaleTimeString();
        console.log(`[${displayDate} DGTInjectable] Figuring out project type`);
        try {
            injectableImport = '@nestjs/common';
            console.log(`[${displayDate} DGTInjectable] Project type: nestjs`);
            return require(injectableImport).Injectable();
        } catch (e) {
            injectableImport = '@angular/core';
            console.log(`[${displayDate} DGTInjectable] Project type: angular`);
            return require(injectableImport).Injectable();
        }
    }
    return require(injectableImport).Injectable();
}
