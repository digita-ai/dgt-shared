import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { DismissNotification } from '../../state/models/dgt-actions.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTNotification } from './dgt-notification.model';

export abstract class DGTSmartElement<T extends DGTBaseRootState<DGTBaseAppState>> implements OnDestroy {
  public notifications: DGTNotification[];
  public unsubscribe: Subject<any> = new Subject();

  constructor(protected store: DGTStateStoreService<T>) {
    this.store.select(state => state.app.notifications).subscribe((notifications: DGTNotification[]) => this.notifications = notifications);
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
