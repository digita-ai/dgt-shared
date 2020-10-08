import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DGTActivity, DGTActivityVisibility } from '@digita-ai/dgt-shared-data';

@Component({
  selector: 'dgt-activities',
  templateUrl: './dgt-activities.component.html',
  styleUrls: ['./dgt-activities.component.scss']
})
export class DGTActivitiesComponent implements OnInit {

  public activity: DGTActivity = {
    type: 'commented',
    visibility: DGTActivityVisibility.PRIVATE,
    difference: null,
    responsible: null,
    description: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  @Input() public set activities(activities: DGTActivity[]) {
    if (activities) {
      this.dataSource = new MatTableDataSource(activities);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }
  @Input() public allowComments = false;
  @Output() public commented: EventEmitter<DGTActivity> = new EventEmitter<DGTActivity>();
  public dataSource: MatTableDataSource<DGTActivity>;
  @Input() public entityType: string;
  public formGroup: FormGroup;
  @Input() public isLoading: boolean;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor() {
    this.formGroup = new FormGroup({
      'comment': new FormControl({ value: this.activity.description }, [
        Validators.required
      ]),
    });
  }

  ngOnInit() {
  }

  public onCommented() {
    this.commented.emit(this.activity);
    this.activity = {
      type: 'commented',
      visibility: DGTActivityVisibility.PRIVATE,
      difference: null,
      responsible: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
