import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DGTPlatformService } from '../../platform/services/dgt-platform.service';
import { DGTPlatformType } from '../../platform/models/dgt-platform-type.model';

@Injectable()
export class DGTConnectionService implements OnDestroy {

    static EVENT_TYPE_ONLINE = 'online';
    static EVENT_TYPE_OFFLINE = 'offline';
    public status: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    constructor(private platform: DGTPlatformService) {
        if (this.platform.type === DGTPlatformType.BROWSER && window) {
            this.bind();
            window.addEventListener(DGTConnectionService.EVENT_TYPE_ONLINE, this.onOnline);
            window.addEventListener(DGTConnectionService.EVENT_TYPE_OFFLINE, this.onOffline);
        }
    }

    ngOnDestroy() {
        if (this.platform.type === DGTPlatformType.BROWSER && window) {
            window.removeEventListener(DGTConnectionService.EVENT_TYPE_ONLINE, this.onOnline);
            window.removeEventListener(DGTConnectionService.EVENT_TYPE_OFFLINE, this.onOffline);
        }
    }

    private bind() {
        this.onOnline = this.onOnline.bind(this);
        this.onOffline = this.onOffline.bind(this);
    }

    private onOnline() {
        this.status.next(true);
    }

    private onOffline() {
        this.status.next(false);
    }
}
