import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'dgt-page-rail-item',
  templateUrl: './dgt-page-rail-item.component.html',
  styleUrls: ['./dgt-page-rail-item.component.scss'],
})
export class DGTPageRailItemComponent implements OnInit {

  @Input() @HostBinding('class.selected') selected = false;

  constructor() { }

  ngOnInit() {
  }

}
