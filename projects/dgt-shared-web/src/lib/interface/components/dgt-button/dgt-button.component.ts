import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { DGTColor } from '../../models/dgt-color.model';
import { DGTButtonConfirmComponent } from '../dgt-button-confirm/dgt-button-confirm.component';

@Component({
  selector: 'dgt-button',
  templateUrl: './dgt-button.component.html',
  styleUrls: ['./dgt-button.component.scss'],
})
export class DGTButtonComponent implements OnInit {

  @Input() public color: DGTColor = DGTColor.BASIC;
  @Input() public confirm = false;
  @Input() public disabled = false;
  @Input() public loading = false;
  @Input() public showContent = true;
  @Input() public loadingEnabled = true;
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

    this.loading = true && this.loadingEnabled;

    if (this.confirm) {
      this.logger.debug(DGTButtonComponent.name, 'Button clicked, launching confirm dialog');

      const dialogRef = this.dialog.open(DGTButtonConfirmComponent, {
        width: '450px',
        height: '300px',
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
