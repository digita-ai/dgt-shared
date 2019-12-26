import { Component, OnInit, Input} from '@angular/core';
import { DGTColor } from '../../models/dgt-color.model';

@Component({
  selector: 'dgt-chip',
  templateUrl: './dgt-chip.component.html',
  styleUrls: ['./dgt-chip.component.scss']
})
export class DGTChipComponent implements OnInit {

  @Input() public color: DGTColor = DGTColor.BASIC;

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
