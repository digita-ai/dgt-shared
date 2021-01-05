import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DGTEvent, DGTExchange, DGTSourceSolid } from '@digita-ai/dgt-shared-data';
import { DGTLoggerService, DGTErrorArgument } from '@digita-ai/dgt-shared-utils';
import { DGTDateToLabelService } from '../../../date/services/dgt-date-to-label.service';
import * as _ from 'lodash';

@Component({
  selector: 'dgt-timeline-event-group',
  templateUrl: './timeline-event-group.component.html',
  styleUrls: ['./timeline-event-group.component.scss'],
})

/** Container component for grouping TimelineEventSummaries by day*/
export class DGTTimelineEventGroupComponent implements OnInit {

  public groupedEvents: DGTEvent[][] = [];
  
  private _events: DGTEvent[];
  get events(): DGTEvent[] { return this._events; }
  @Input() set events(events: DGTEvent[]) {
    this._events = events;
    if (events) {
      this.groupedEvents = this.groupEvents(events);
    }
  };
  
  
  
  private _date: Date = null;
  get date(): Date { return this._date; }
  @Input() set date(date: Date) {
    this._date = date;
    if (date) {
      this.dateToLabelService.dateToReadableString(date).subscribe(translatedDate => {
        this.displayDate = translatedDate;
      });
    }
  }

  @Input() public sources: DGTSourceSolid[];
  @Input() public exchanges: DGTExchange[];


  @Output() eventReported: EventEmitter<DGTEvent[]> = new EventEmitter<DGTEvent[]>();
  @Output() eventRemoved: EventEmitter<DGTEvent[]> = new EventEmitter<DGTEvent[]>();

  public displayDate: string;

  constructor(
    private logger: DGTLoggerService,
    private dateToLabelService: DGTDateToLabelService,
  ) { }

  ngOnInit() { }

  /**
   * @param events List of events to give feedback for
   * @throws DGTErrorArgument when arguments are incorrect.
   * @emits
  */
  public onEventReported(events: DGTEvent[]) {
    if (!events) {
      throw new DGTErrorArgument('Parameter events should be set', events);
    }
    this.logger.debug(DGTTimelineEventGroupComponent.name, 'Reporting Event', events)
    this.eventReported.emit(events);
  }

  /**
   * @param events List of events to remove
   * @throws DGTErrorArgument when arguments are incorrect.
   * @emits
  */
  public onEventRemoved(events: DGTEvent[]) {
    if (!events) {
      throw new DGTErrorArgument('Parameter events should be set', events);
    }
    this.logger.debug(DGTTimelineEventGroupComponent.name, 'Removing event', events)
    this.eventRemoved.emit(events);
  }

  /**
   * Checks if two events are similar
   * @remarks similar: same stakeholder(uri), description and connection
   * @param event1 first event to compare
   * @param event2 second event to compare
   * @throws DGTErrorArgument when arguments are incorrect.
   * @returns true if events are similar, otherwise false
   */
  private areSimilarEvents(event1: DGTEvent, event2: DGTEvent) {
    if (!event1) {
      throw new DGTErrorArgument('Parameter event1 should be set', event1);
    }
    if (!event2) {
      throw new DGTErrorArgument('Parameter event2 should be set', event2);
    }
    return event1.stakeholder === event2.stakeholder &&
      event1.stakeholderUri === event2.stakeholderUri &&
      event1.description === event2.description &&
      event1.exchange === event2.exchange;
  }

  /**
   * Groups similar events.
   * @param events Events to be grouped.
   * @throws DGTErrorArgument when arguments are incorrect.
   * @returns Events grouped by similarity.
   */
  public groupEvents(events: DGTEvent[]): DGTEvent[][] {
    if (!events) {
      throw new DGTErrorArgument('Parameter events should be set', events);
    }
    const res = [];

    events.forEach(event => {
      if (res.length === 0) {
        res.push([event]);
      } else {
        let similarEventAlreadyExists = false;

        for (let i = 0; i < res.length; i++) {
          if (this.areSimilarEvents(res[i][0], event)) {
            res[i] = [...res[i], event];
            similarEventAlreadyExists = true;
          }
        }

        if (!similarEventAlreadyExists) {
          res.push([event]);
        }
      }
    });

    return res;
  }
}
