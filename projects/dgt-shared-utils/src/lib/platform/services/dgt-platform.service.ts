import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DGTPlatformType } from '../models/dgt-platform-type.model';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';

@Injectable()
export class DGTPlatformService {

    public type: DGTPlatformType = DGTPlatformType.NOT_SET;

    constructor(@Inject(PLATFORM_ID) platformId: string) {
        if (platformId && isPlatformServer(platformId)) {
            this.type = DGTPlatformType.SERVER;
        } else if (platformId && isPlatformBrowser(platformId)) {
            this.type = DGTPlatformType.BROWSER;
        }
    }
}
