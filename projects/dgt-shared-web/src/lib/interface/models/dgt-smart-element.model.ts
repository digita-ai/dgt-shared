import { DGTStoreService } from '../../state/services/dgt-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTNotification } from './dgt-notification.model';
import { DismissNotification } from '../../state/models/dgt-actions.model';
import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

export abstract class DGTSmartElement<T extends DGTBaseRootState<DGTBaseAppState>> implements OnDestroy {
  public notifications: Array<DGTNotification>;
  public unsubscribe: Subject<void> = new Subject();

  constructor(protected store: DGTStoreService<T>) {
    this.store.select(state => state.app.notifications).subscribe(notifications => this.notifications = notifications);
  }

  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe.next();
      this.unsubscribe.complete();
    }
  }

  onNotificationDismissed(notification: DGTNotification) {
    if (notification) {
      this.store.dispatch(new DismissNotification(notification.message));
    }
  }
}
