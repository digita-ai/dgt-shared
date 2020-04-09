import { Component, Input, EventEmitter, Output } from '@angular/core';
import { DGTSectionState } from '../../models/dgt-section-style.model';
import * as _ from 'lodash';

@Component({
  selector: 'dgt-section',
  templateUrl: './dgt-section.component.html',
  styleUrls: ['./dgt-section.component.scss']
})
export class DGTSectionComponent {

  public get showSummary(): boolean {
    let res = false;

    if (_.includes([DGTSectionState.SUCCESS, DGTSectionState.LOCKED, DGTSectionState.LOADING], this.state)) {
      res = true;
    }

    return res;
  }
  public get showTitle(): boolean {
    let res = false;

    if (_.includes([DGTSectionState.NORMAL, DGTSectionState.BLUE, DGTSectionState.COLLAPSED,
      DGTSectionState.SUCCESS, DGTSectionState.LOCKED, DGTSectionState.LOADING, DGTSectionState.WARNING], this.state) && this.enableTitle) {
      res = true;
    }

    return res;
  }
  public get showReset(): boolean {
    let res = false;

    if (_.includes([DGTSectionState.SUCCESS], this.state)) {
      res = true;
    }

    return res;
  }
  public get showLoading(): boolean {
    let res = false;

    if (_.includes([DGTSectionState.LOADING], this.state)) {
      res = true;
    }

    return res;
  }
  @Input() public enableTitle = true;
  @Input() public showSubtitle = false;
  @Input() public showIcon = false;
  @Input() public showContent = false;
  @Input() public state: DGTSectionState = DGTSectionState.NORMAL;
  @Output() public reset: EventEmitter<void> = new EventEmitter<void>();
  @Input() public gapUnderTitleInPixels = 20;

  constructor() { }

  public onReset() {
    this.reset.emit();
  }
}
