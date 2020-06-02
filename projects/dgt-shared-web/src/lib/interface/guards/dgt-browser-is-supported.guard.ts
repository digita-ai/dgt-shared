import { Injectable } from '@angular/core';
import { CanLoad, Route, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { DGTLoggerService } from '@digita/dgt-shared-utils';
import { Navigate } from '../../state/models/dgt-actions.model';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

@Injectable()
export class DGTBrowserIsSupportedGuard implements CanLoad, CanActivate, CanActivateChild {
    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
        return this.isBrowserSupported();
    }

    canLoad(route: Route): boolean | Observable<boolean> | Promise<boolean> {
        return this.isBrowserSupported();
    }

    canActivate(route: ActivatedRouteSnapshot, routeState: RouterStateSnapshot): boolean {
        return this.isBrowserSupported();
    }

    private isBrowserSupported(): boolean {
        let res = true;

        this.logger.debug(DGTBrowserIsSupportedGuard.name, 'Starting to check browser support', { userAgent: window.navigator.userAgent });

        if (window.navigator.userAgent.match(/(MSIE|Trident)/)) {
            this.logger.debug(DGTBrowserIsSupportedGuard.name, 'Identitified browser as internet explorer, redirecting.', { userAgent: window.navigator.userAgent });
            res = false;

            this.store.dispatch(new Navigate({ path: ['/support', 'browser-support'] }));
        }

        return res;
    }

    constructor(private logger: DGTLoggerService, private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>) { }
}
