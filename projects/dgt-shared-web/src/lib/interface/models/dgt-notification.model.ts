import { DGTNotificationType } from './dgt-notification-type.model';

export class DGTNotification {
  constructor(public type: DGTNotificationType, public message: string, public ttl: number = 1) { }
}
