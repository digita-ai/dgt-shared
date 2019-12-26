import { Component, Input } from '@angular/core';

@Component({
  selector: 'dgt-section-help',
  templateUrl: './dgt-section-help.component.html',
  styleUrls: ['./dgt-section-help.component.scss']
})
export class DGTSectionHelpComponent {

  @Input() public summary = '';

  constructor() { }

}
