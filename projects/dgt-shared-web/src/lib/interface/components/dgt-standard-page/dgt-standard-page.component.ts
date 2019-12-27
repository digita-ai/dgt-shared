import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';
import { DGTUser } from '../../../security/models/dgt-user.model';

@Component({
  selector: 'dgt-standard-page',
  templateUrl: './dgt-standard-page.component.html',
  styleUrls: ['./dgt-standard-page.component.scss'],
  animations: [
    trigger(
      'myAnimation',
      [
        transition(
          ':enter', [
            style({ transform: 'translateX(100%)', opacity: 0 }),
            animate('350ms', style({ transform: 'translateX(0)', 'opacity': 1 }))
          ]
        ),
        transition(
          ':leave', [
            style({ transform: 'translateX(0)', 'opacity': 1 }),
            animate('350ms', style({ transform: 'translateX(100%)', 'opacity': 0 }))
          ]
        )]
    )
  ],
})
export class DGTStandardPageComponent implements OnInit {
  @Input() public authenticatedProfile: DGTUser;
  @Input() public fabEnabled = false;
  @Output() public fabClicked: EventEmitter<void> = new EventEmitter<void>();
  @Input() public fabHelpSummary = '';
  public isFabHelpSummaryShown = false;

  constructor() {
  }

  ngOnInit() {
    of(null)
      .pipe(
        delay(3000),
        tap(() => this.isFabHelpSummaryShown = true),
        delay(15000),
        tap(() => this.isFabHelpSummaryShown = false)
      )
      .subscribe(() => console.log('finished'));
  }

  public onFabClicked() {
    this.fabClicked.emit();
  }

}
