import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnDestroy, Optional, Output, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NgControl, Validators } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material';
import { DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import moment from 'moment';
import { Subject } from 'rxjs';

@Component({
  selector: 'dgt-form-date',
  templateUrl: './dgt-form-date.component.html',
  styleUrls: ['./dgt-form-date.component.scss'],
  providers: [{ provide: MatFormFieldControl, useExisting: DGTFormDateComponent }],
})
export class DGTFormDateComponent implements MatFormFieldControl<Date>, OnDestroy, ControlValueAccessor {
  static nextId = 0;
  public formGroup: FormGroup;

  private _year: number;
  public get year(): number {
    return this._year;
  }
  public set year(v: number) {
    this.logger.debug(DGTFormDateComponent.name, 'Updating year', { oldValue: this._year, newValue: v });

    if (this._year !== v) {
      this._year = v;

      this.setDate(this.year, this.month, this.day);
    }
  }

  private _month: number;
  public get month(): number {
    return this._month;
  }
  public set month(v: number) {
    this.logger.debug(DGTFormDateComponent.name, 'Updating month', { oldValue: this._month, newValue: v });

    if (this._month !== v) {
      this._month = v;

      this.setDate(this.year, this.month, this.day);
    }
  }

  private _day: number;
  public get day(): number {
    return this._day;
  }
  public set day(v: number,
  ) {
    this.logger.debug(DGTFormDateComponent.name, 'Updating day', { oldValue: this._day, newValue: v });

    if (this._day !== v) {
      this._day = v;

      this.setDate(this.year, this.month, this.day);
    }
  }

  public stateChanges: Subject<void> = new Subject<void>();

  @HostBinding() id = `dgt-form-date-${DGTFormDateComponent.nextId++}`;
  public focused: boolean;
  get empty() {
    const n = this.formGroup.value;
    return !n.year && !n.month && !n.day;
  }
  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return true;
  }
  get required() {
    return this._required;
  }
  @Input()
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }
  private _required = false;
  get disabled(): boolean { return this._disabled; }
  @Input()
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.formGroup.disable() : this.formGroup.enable();
    this.stateChanges.next();
  }
  private _disabled = false;
  public errorState = false;
  public controlType = 'dgt-form-date';
  public autofilled = false;

  @HostBinding('attr.aria-describedby') describedBy = '';
  get placeholder() {
    return this._placeholder;
  }
  @Input()
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }
  private _placeholder: string;

  private _value: Date = null;
  @Output() valueChange = new EventEmitter<Date>();

  get value(): Date {
    return this._value;
  }

  @Input()
  set value(val: Date) {
    this.logger.debug(DGTFormDateComponent.name, 'Setting new date', { oldValue: this.value, newValue: val });

    if (!_.isEqual(val, this._value)) {
      this._value = val;

      if (val) {
        const parsedMoment = moment(val);
        this._year = parsedMoment.year();
        this._month = parsedMoment.month() + 1;
        this._day = parsedMoment.date();
      }
      this.valueChange.emit(val);
      this.stateChanges.next();
    }

    this.onChanged(val);
  }

  constructor(
    private logger: DGTLoggerService,
    private fm: FocusMonitor,
    private elRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl,
  ) {
    this.formGroup = new FormGroup({
      'year': new FormControl(this.year, [
        Validators.required,
      ]),
      'month': new FormControl(this.month, [
        Validators.required,
      ]),
      'day': new FormControl(this.day, [
        Validators.required,
      ]),
    });

    // Replace the provider from above with this.
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }

    fm.monitor(elRef.nativeElement, true).subscribe(origin => {
      this.logger.debug(DGTFormDateComponent.name, 'Focus monitor triggered', { origin });

      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onChanged(value) {
    this.logger.debug(DGTFormDateComponent.name, 'Calling change event', { value });

    this.onChange(value);
    this.onTouched();
  }
  onChange: (_: any) => void = () => { };
  onTouched: any = () => { };
  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this.elRef.nativeElement.querySelector('input').focus();
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);
  }

  writeValue(obj: any): void {
    this.logger.debug(DGTFormDateComponent.name, 'Writing value', { current: this.value, new: obj });

    if (obj && obj !== this.value) {
      this.value = obj;
    }
  }
  registerOnChange(fn: (_: any) => void): void {
    if (fn) {
      this.onChange = fn;
    }
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  setDate(year: number, month: number, day: number) {
    const parsedMoment = moment.utc({year, month: month - 1, date: day});

    if (year && month && day && parsedMoment.isValid() && year > 1900) {
      this.value = parsedMoment.toDate();
    } else {
      this.value = null;
    }
  }
}
