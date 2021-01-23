/** Used to store require object */
let res;

/**
 * This is a wrapper decorator that can be used in both Angular and nestjs projects
 * It will determine between Angular and nestjs' @DGTInjectable() decorator
 * So that services written in Angular projects can be used in nestjs projects and vice-versa
 */
export function DGTInjectable() {
    if (!res) {
        try {
            res = require('@nestjs/common').Injectable;
        } catch (e) {
            res = require('@angular/core').Injectable;

        }
    }
    return res();
}
