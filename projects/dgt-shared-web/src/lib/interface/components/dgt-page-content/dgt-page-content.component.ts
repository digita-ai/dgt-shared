import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'dgt-page-content',
  templateUrl: './dgt-page-content.component.html',
  styleUrls: ['./dgt-page-content.component.scss']
})
export class DGTPageContentComponent implements OnInit {

  /** Enables the right sidepane */
  @Input() public paneEnabled = false;

  constructor() { }

  ngOnInit() {
  }

}
