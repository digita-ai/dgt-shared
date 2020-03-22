import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'dgt-page-rail-item',
  templateUrl: './dgt-page-rail-item.component.html',
  styleUrls: ['./dgt-page-rail-item.component.scss']
})
export class DGTPageRailItemComponent implements OnInit {
  @Input() public routerLink: string[];

  constructor() { }

  ngOnInit() {
  }

}
