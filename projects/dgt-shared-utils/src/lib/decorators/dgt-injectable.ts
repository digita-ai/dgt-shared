/** Used to store require object */
let projectType = null;
/**
 * This is a wrapper decorator that can be used in both Angular and nestjs projects
 * It will determine between Angular and nestjs' @DGTInjectable() decorator
 * So that services written in Angular projects can be used in nestjs projects and vice-versa
 */
export function DGTInjectable() {
    if (!projectType) {
        const displayDate: string = new Date().toLocaleTimeString();
        console.log(`[${displayDate} DGTInjectable] Figuring out project type`);
        try {
            projectType = require('@nestjs/common');
            console.log(`[${displayDate} DGTInjectable] Type: Nestjs project`);
        } catch (e) {
            if (e.code !== 'MODULE_NOT_FOUND') {
                throw e;
            }
            projectType = require('@angular/core');
            console.log(`[${displayDate} DGTInjectable] Type: Angular project`);
        }
    }
    return projectType.DGTInjectable();
}
