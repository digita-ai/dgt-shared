import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DGTColor } from '../../models/dgt-color.model';

@Component({
  selector: 'dgt-link',
  templateUrl: './dgt-link.component.html',
  styleUrls: ['./dgt-link.component.scss']
})
export class DGTLinkComponent implements OnInit {

  @Input() public color: DGTColor = DGTColor.BASIC;
  @Input() public route: Array<string> = null;
  @Output() public called: EventEmitter<any> = new EventEmitter<any>();

  public get colorBase(): string {
    let res = 'basic';

    if (this.color) {
      res = this.color
    }

    return res;
  }

  constructor() { }

  ngOnInit() {
  }
}
