import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'dgt-page-header-profile',
  templateUrl: './dgt-page-header-profile.component.html',
  styleUrls: ['./dgt-page-header-profile.component.scss']
})
export class DGTPageHeaderProfileComponent implements OnInit {

  @Input() public profile: any;

  constructor() { }

  ngOnInit() {
  }

}
