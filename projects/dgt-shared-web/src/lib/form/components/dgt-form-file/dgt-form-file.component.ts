import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, ElementRef, EventEmitter, HostBinding, Input, OnDestroy, Optional, Output, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material';
import { DGTFile } from '@digita-ai/dgt-shared-data';
import { DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Subject } from 'rxjs';

@Component({
  selector: 'dgt-form-file',
  templateUrl: './dgt-form-file.component.html',
  styleUrls: ['./dgt-form-file.component.scss'],
  providers: [{ provide: MatFormFieldControl, useExisting: DGTFormFileComponent }],
})
export class DGTFormFileComponent implements MatFormFieldControl<DGTFile>, OnDestroy, ControlValueAccessor {
  static nextId = 0;
  @ViewChild('file') file;
  public fileObject: File = null;
  public stateChanges: Subject<void> = new Subject<void>();

  @HostBinding() id = `dgt-form-file-${DGTFormFileComponent.nextId++}`;
  public focused: boolean;
  get empty() {
    return !this.value;
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
    this.stateChanges.next();
  }
  private _disabled = false;
  public errorState = false;
  public controlType = 'dgt-form-file';
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

  private _value: DGTFile = null;
  @Output() valueChange = new EventEmitter<DGTFile>();

  get value(): DGTFile {
    return this._value;
  }

  @Input()
  set value(val: DGTFile) {
    this.logger.debug(DGTFormFileComponent.name, 'Setting new date', { oldValue: this.value, newValue: val });

    if (!_.isEqual(val, this._value)) {
      this._value = val;

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

    // Replace the provider from above with this.
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }

    fm.monitor(elRef.nativeElement, true).subscribe(origin => {
      this.logger.debug(DGTFormFileComponent.name, 'Focus monitor triggered', { origin });

      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onChanged(value) {
    this.logger.debug(DGTFormFileComponent.name, 'Calling change event', { value });

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
    this.logger.debug(DGTFormFileComponent.name, 'Writing value', { current: this.value, new: obj });

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

  public onTriggerFileUpload() {
    this.file.nativeElement.click();
  }

  public redoPicture() {
    this.value = null;
  }

  onFilesAdded() {
    const files: { [key: string]: File } = this.file.nativeElement.files;

    for (const key in files) {
      // tslint:disable-next-line:radix
      if (!isNaN(parseInt(key))) {
        this.fileObject = files[key];

        const reader = new FileReader();
        reader.onloadend = (e: any) => {
          this.logger.debug(DGTFormFileComponent.name, 'Filereader finished reading file', e);
          const orginalImage = DGTFile.fromArrayBuffer(this.fileObject.type, e.target.result);

          this.value = orginalImage;
        };
        reader.readAsArrayBuffer(this.fileObject);
      }
    }
  }
}
