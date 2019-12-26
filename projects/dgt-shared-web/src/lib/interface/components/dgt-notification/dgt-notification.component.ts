import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DGTNotificationType } from '../../models/dgt-notification-type.model';

@Component({
  selector: 'dgt-notification',
  templateUrl: './dgt-notification.component.html',
  styleUrls: ['./dgt-notification.component.css']
})
export class DGTNotificationComponent {

  @Input() public type: DGTNotificationType;
  @Output() public notificationDismissed: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  public onNotificationDismissed() {
    this.notificationDismissed.emit();
  }

}
