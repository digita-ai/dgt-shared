import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DGTEvent, DGTExchange, DGTSource } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';

@Component({
  selector: 'dgt-timeline-page',
  templateUrl: './timeline-page.component.html',
  styleUrls: ['./timeline-page.component.scss'],
})

export class DGTTimelinePageComponent implements OnInit {

  // a list of which items to show in the dots menu
  @Input() public dotsMenuItems: string[];

  private _events: DGTEvent[];
  @Input() set events(events: DGTEvent[]) {
    this._events = events;
    this.updateReceived();
  };
  get events(): DGTEvent[] {
    return this._events;
  }
  /** All events grouped by date [{date, events}, ...]. */
  public eventsByDate;
  public today: Date = new Date();

  @Input() public sources: DGTSource<any>[];
  @Input() public exchanges: DGTExchange[];

  @Output() public eventRemoved: EventEmitter<DGTEvent[]> = new EventEmitter();
  @Output() public eventReported: EventEmitter<DGTEvent[]> = new EventEmitter();
  @Output() public showJustification: EventEmitter<DGTEvent[]> = new EventEmitter();
  @Output() public showInVault: EventEmitter<DGTEvent[]> = new EventEmitter();

  constructor(
    private logger: DGTLoggerService,
  ) { }

  ngOnInit() { }

  public updateReceived(): void {
    if (this.events && this.events.length > 0) {
      this.eventsByDate = _.chain(this.events)
        .filter((event: DGTEvent) => event !== null && event.date !== null && event.date !== undefined)
        .groupBy((event: DGTEvent) => event.date.toDateString())
        .map((groupedEvents: DGTEvent[], date) => {
          return {
            date: new Date(date),
            events: _.orderBy(groupedEvents, (event: DGTEvent) => event.date, 'desc'),
          }
        })
        .orderBy(entry => entry.date, 'desc')
        .value();
      this.logger.debug(DGTTimelinePageComponent.name, 'Grouped Events By Date', this.eventsByDate);
    }
  }

  public onEventRemoved(events: DGTEvent[]) {
    if (!events) {
      throw new DGTErrorArgument(DGTTimelinePageComponent.name, 'events should be set');
    }
    this.eventRemoved.emit(events);
  }

  public onEventReported(events: DGTEvent[]) {
    if (!events) {
      throw new DGTErrorArgument(DGTTimelinePageComponent.name, 'events should be set');
    }
    this.eventReported.emit(events);
  }

  public onShowJustification(events: DGTEvent[]) {
    if (!events) {
      throw new DGTErrorArgument(DGTTimelinePageComponent.name, 'events should be set');
    }
    this.showJustification.emit(events);
  }

  public onShowInVault(events: DGTEvent[]) {
    if (!events) {
      throw new DGTErrorArgument(DGTTimelinePageComponent.name, 'events should be set');
    }
    this.showInVault.emit(events);
  }
}
