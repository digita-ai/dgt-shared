import { OnDestroy, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DGTConnectivityService implements OnDestroy {

  static EVENT_TYPE_ONLINE = 'online';
  static EVENT_TYPE_OFFLINE = 'offline';
  public status: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor() {

    if (window) {

      this.bind();
      window.addEventListener(DGTConnectivityService.EVENT_TYPE_ONLINE, this.onOnline);
      window.addEventListener(DGTConnectivityService.EVENT_TYPE_OFFLINE, this.onOffline);

    }

  }

  ngOnDestroy() {

    if (window) {

      window.removeEventListener(DGTConnectivityService.EVENT_TYPE_ONLINE, this.onOnline);
      window.removeEventListener(DGTConnectivityService.EVENT_TYPE_OFFLINE, this.onOffline);

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
