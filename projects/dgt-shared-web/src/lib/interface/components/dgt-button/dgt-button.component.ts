import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DGTColor } from '../../models/dgt-color.model';
import { MatDialog } from '@angular/material';
import { DGTButtonConfirmComponent } from '../dgt-button-confirm/dgt-button-confirm.component';
import { DGTLoggerService } from '@digita/dgt-shared-utils';

@Component({
  selector: 'dgt-button',
  templateUrl: './dgt-button.component.html',
  styleUrls: ['./dgt-button.component.scss']
})
export class DGTButtonComponent implements OnInit {

  @Input() public color: DGTColor = DGTColor.BASIC;
  @Input() public confirm = false;
  @Input() public disabled = false;
  @Input() public loading = false;
  @Input() public showContent = true;
  @Output() public called: EventEmitter<any> = new EventEmitter<any>();

  public get colorBase(): string {
    let res = 'basic';

    if (this.color) {
      res = this.color;
    }

    return res;
  }

  constructor(private logger: DGTLoggerService, private dialog: MatDialog) { }

  ngOnInit() {
  }

  public onClick() {

    this.loading = true;

    if (this.confirm) {
      this.logger.debug(DGTButtonComponent.name, 'Button clicked, launching confirm dialog');

      const dialogRef = this.dialog.open(DGTButtonConfirmComponent, {
        width: '600px',
        height: '400px',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        this.logger.debug(DGTButtonComponent.name, 'Button confirmation closed', result);
        if (result) {
          this.called.emit();
        }
      });
    } else {
      this.logger.debug(DGTButtonComponent.name, 'Button clicked, emitting click');
      this.called.emit();
    }
  }

}
