import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'dgt-section-icon',
  templateUrl: './dgt-section-icon.component.html',
  styleUrls: ['./dgt-section-icon.component.scss'],
})
export class DGTSectionIconComponent implements OnInit {

  private _iconString: string;
  @Input() set iconString(iconString: string) {
    if (iconString) {
      const reg = iconString.match(/fa.\sfa-.*/);
      this.isFAIcon = reg && reg.length > 0;
      this._iconString = iconString;
    }
  }
  get iconString(): string {
    return this._iconString;
  }

  public isFAIcon = false;

  constructor() { }

  ngOnInit() { }

}
