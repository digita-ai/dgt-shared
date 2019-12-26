import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'dgt-split-page-header-profile',
  templateUrl: './dgt-split-page-header-profile.component.html',
  styleUrls: ['./dgt-split-page-header-profile.component.scss']
})
export class DGTSplitPageHeaderProfileComponent implements OnInit {

  @Input() public profile: any;

  constructor() { }

  ngOnInit() {
  }

}
