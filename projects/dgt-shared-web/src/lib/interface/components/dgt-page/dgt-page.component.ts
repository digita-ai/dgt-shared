import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';
import { DGTLoggerService } from '@digita/dgt-shared-utils';

@Component({
  selector: 'dgt-page',
  templateUrl: './dgt-page.component.html',
  styleUrls: ['./dgt-page.component.scss'],
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
export class DGTPageComponent implements OnInit {
  @Input() public sidenavEnabled = true;
  @Input() public sidenavSize = '300px';
  @Input() public railEnabled = true;
  /** Show header always */
  @Input() public headerEnabled = true;
  /** Show header on mobile*/
  @Input() public mobileHeaderEnabled = true;
  @Input() public headerLogoEnabled = true;
  @Input() public subHeaderEnabled = true;
  @Input() public contentPaddingEnabled = true;
  @Input() public fabEnabled = false;
  @Output() public fabClicked: EventEmitter<void> = new EventEmitter<void>();
  @Input() public fabHelpSummary = '';
  @Input() public fabHelpSummaryEnabled = false;
  public isFabHelpSummaryShown = false;
  public opened = true;
  public isSmallDevice = false;

  constructor(private media: MediaObserver, private logger: DGTLoggerService) {
    this.opened = this.media.isActive('gt-sm');
    this.isSmallDevice = !this.media.isActive('gt-sm');

    this.media.media$.subscribe((value: MediaChange) => {
      this.opened = this.media.isActive('gt-sm');
      this.isSmallDevice = !this.media.isActive('gt-sm');

      this.logger.debug(DGTPageComponent.name, 'Captured media change', { opened: this.opened, isSmallDevice: this.isSmallDevice });
    });
  }

  ngOnInit() {
    if (this.fabHelpSummaryEnabled) {
      of(null)
        .pipe(
          delay(3000),
          tap(() => this.isFabHelpSummaryShown = true),
          delay(15000),
          tap(() => this.isFabHelpSummaryShown = false)
        )
        .subscribe(() => console.log('finished'));
    }
  }

  public onFabClicked() {
    this.fabClicked.emit();
  }

}
