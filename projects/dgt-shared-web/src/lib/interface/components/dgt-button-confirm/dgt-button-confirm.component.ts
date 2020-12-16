import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { DGTLoggerService } from '@digita-ai/dgt-shared-utils';

@Component({
  selector: 'dgt-button-confirm',
  templateUrl: './dgt-button-confirm.component.html',
  styleUrls: ['./dgt-button-confirm.component.scss'],
})
export class DGTButtonConfirmComponent implements OnInit {

  constructor(private logger: DGTLoggerService, private dialogRef: MatDialogRef<DGTButtonConfirmComponent>) { }

  ngOnInit() {
  }

  public close(result: boolean) {
    this.logger.debug(DGTButtonConfirmComponent.name, 'Closing button confirmation', result);
    this.dialogRef.close(result);
  }

}
