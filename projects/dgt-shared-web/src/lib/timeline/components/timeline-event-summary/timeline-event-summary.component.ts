import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DGTEvent, DGTExchange, DGTSourceSolid } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { DGTDateToLabelService } from '../../../date/services/dgt-date-to-label.service';
import { DGTMenuComponent } from '../../../interface/components/dgt-menu/dgt-menu.component';

@Component({
  selector: 'dgt-timeline-event-summary',
  templateUrl: './timeline-event-summary.component.html',
  styleUrls: ['./timeline-event-summary.component.scss'],
})
/**
 * Displays an event's information (description, date, stakeholder, ...).
 * If the amount of events given is greater than 1, a small circle will
 * appear next to the event's icon, indicating the amount of similar events in this summary.
 * Contains buttons for giving feedback and opening the interaction menu.
 */
export class DGTTimelineEventSummaryComponent implements OnInit {

  // a list of which items to show in the dots menu
  @Input() public dotsMenuItems: string[]

  /** The list of similar events of the summary */
  private _events: DGTEvent[] = null;
  @Input() set events(events: DGTEvent[]) {
    this._events = events;

    if (this.events && this.sources && this.exchanges) {
      this.update(this.events, this.sources, this.exchanges);
    }
  }
  get events(): DGTEvent[] { return this._events; }

  private _sources: DGTSourceSolid[];
  get sources(): DGTSourceSolid[] {
    return this._sources;
  }
  @Input() set sources(v: DGTSourceSolid[]) {
    this._sources = v;

    if (this.events && this.sources && this.exchanges) {
      this.update(this.events, this.sources, this.exchanges);
    }
  }

  private _exchanges: DGTExchange[];
  get exchanges(): DGTExchange[] {
    return this._exchanges;
  }
  @Input()
  set exchanges(v: DGTExchange[]) {
    this._exchanges = v;

    if (this.events && this.sources && this.exchanges) {
      this.update(this.events, this.sources, this.exchanges);
    }
  }

  public showBadge = false;

  /** Needed to open the menu programatically */
  @ViewChild(DGTMenuComponent) childComponentMenu: DGTMenuComponent;

  @Output() eventReported: EventEmitter<DGTEvent[]> = new EventEmitter<DGTEvent[]>();
  @Output() eventRemoved: EventEmitter<DGTEvent[]> = new EventEmitter<DGTEvent[]>();
  @Output() showJustification: EventEmitter<DGTEvent[]> = new EventEmitter<DGTEvent[]>();
  @Output() showInVault: EventEmitter<DGTEvent[]> = new EventEmitter<DGTEvent[]>();

  /** Amount of time since the creation of the event, in readable format */
  public timeAgoDisplayString: string;
  /** Location of the event's icon */
  public iconUri: string;
  /** Name of the stakeholder of the event */
  public stakeholder: string;
  /** Description of the event */
  public description: string;
  /** Provider of the pod on which the event is stored */
  public podProvider: string;
  /** Full uri of the stakeholder, including https:// prefix */
  public uri: string;
  /** Uri of the stakeholder, without https:// prefix*/
  public cutUri: string;
  /** Amount of similar events in this summary, used in the badge */
  public amount: string;

  constructor(
    private logger: DGTLoggerService,
    private dateToLabelService: DGTDateToLabelService,
  ) { }

  ngOnInit() { }

  /**
   * @param events List of events to give feedback for
   * @emits
  */
  public onEventReported(events: DGTEvent[]) {
    if (!events) {
      throw new DGTErrorArgument('Parameter events should be set', events);
    }
    this.logger.debug(DGTTimelineEventSummaryComponent.name, 'Event Feedback', events);
    this.eventReported.emit(events);
  }

  /**
   * @param events List of events to remove
   * @emits
  */
  public onEventRemoved(events: DGTEvent[]) {
    if (!events) {
      throw new DGTErrorArgument('Parameter events should be set', events);
    }
    this.logger.debug(DGTTimelineEventSummaryComponent.name, 'Event Removed', events);
    this.eventRemoved.emit(events);
  }

  public onShowJustification(events: DGTEvent[]) {
    if (!events) {
      throw new DGTErrorArgument('Parameter events should be set', events);
    }
    this.logger.debug(DGTTimelineEventSummaryComponent.name, 'Showing justificaiton', events);
    this.showJustification.emit(events);
  }

  public onShowInVault(events: DGTEvent[]) {
    if (!events) {
      throw new DGTErrorArgument('Parameter events should be set', events);
    }
    this.logger.debug(DGTTimelineEventSummaryComponent.name, 'Showing in vault', events);
    this.showInVault.emit(events);
  }

  public update(events: DGTEvent[], sources: DGTSourceSolid[], exchagnges: DGTExchange[]) {
    if (!events) {
      throw new DGTErrorArgument('Parameter events should be set', events);
    }
    if (events.length === 0) {
      throw new DGTErrorArgument('events should be set and should contain at least 1 event.', events);
    }
    if (!sources) {
      throw new DGTErrorArgument('Parameter events should be set', events);
    }

    const firstEvent = events[0];
    const exchange = exchagnges.find(e => e.uri === firstEvent.exchange);
    const firstSource = exchange ? sources.find(s => s.uri === exchange.source) : null;

    this.dateToLabelService.dateToTimeAgoString(firstEvent.date).subscribe(translatedDate => {
      this.timeAgoDisplayString = translatedDate;
    });
    this.iconUri = firstEvent.icon;
    if (this.iconUri === null || this.iconUri.trim() === '') {
      this.iconUri = null;
    }
    this.stakeholder = firstEvent.stakeholder;
    this.description = firstEvent.description;
    this.uri = firstEvent.stakeholderUri;
    if (this.uri == null || this.uri.trim() === '') {
      this.cutUri = 'Unknown';
      this.uri = null;
    } else {
      if (this.uri.startsWith('https://') || this.uri.startsWith('http://')) {
        this.cutUri = this.uri.split('//')[1];
      } else {
        this.cutUri = this.uri;
        this.uri = null;
      }
    }

    this.amount = events.length > 99 ? '99+' : events.length.toString();
    this.showBadge = events.length > 1 ? true : false;

    this.podProvider = firstSource && firstSource.description ? firstSource.description : 'Provider Not Known';
  }
}
