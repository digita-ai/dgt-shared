import {
  Component,
  ViewChild,
} from '@angular/core';
import { MatMenu } from '@angular/material';

@Component({
  selector: 'dgt-menu',
  templateUrl: './dgt-menu.component.html',
  styleUrls: ['./dgt-menu.component.scss'],
})

export class DGTMenuComponent {
  /**
   * Angular Material Menu to display
   * Needed to open the menu programatically
   */
  @ViewChild(MatMenu) menu: MatMenu;

  constructor(
  ) { }


}
