import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DGTInjectable } from '../../decorators/dgt-injectable';
import { DGTPlatformType } from '../models/dgt-platform-type.model';

@DGTInjectable()
export class DGTPlatformService {

    public type: DGTPlatformType = DGTPlatformType.NOT_SET;

    constructor(@Inject(PLATFORM_ID) platformId?: string) {
        if (platformId && isPlatformServer(platformId)) {
            this.type = DGTPlatformType.SERVER;
        } else if (platformId && isPlatformBrowser(platformId)) {
            this.type = DGTPlatformType.BROWSER;
        } else if (!platformId) {
            this.type = DGTPlatformType.SERVER;
        }
    }
}
