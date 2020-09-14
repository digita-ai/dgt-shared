import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita/dgt-shared-utils';
import { FormGroup, FormControl } from '@angular/forms';
import { DGTDataValue } from '@digita/dgt-shared-data';

@Component({
    selector: 'dgt-data-interface-phone-value',
    templateUrl: './dgt-data-interface-phone-value.component.html',
    styleUrls: ['./dgt-data-interface-phone-value.component.scss']
})
/** The Data Value component is a detailed view of a single Data Value */
export class DGTDataInterfacePhoneValueComponent implements OnInit {

    /** The form to display the data in */
    public formGroup: FormGroup;

    /** The data value of this component */
    private _value: DGTDataValue;
    @Input()
    public get value(): DGTDataValue {
        return this._value;
    }
    public set value(value: DGTDataValue) {
        this._value = value;

        if (this.value && this.phone) {
            this.updateReceived(this.value, this.phone);
        }
    }

    /** Used to emit valueUpdated events */
    @Output()
    valueUpdated: EventEmitter<{value: DGTDataValue, newObject: any}>;

    /** Used to emit submit events */
    @Output()
    submit: EventEmitter<any>;

    /** input: phone */
    private _phone: string;
    public get phone(): string {
        return this._phone;
    }
    @Input()
    public set phone(v: string) {
        this._phone = v;

        if (this.value && this.phone) {
            this.updateReceived(this.value, this.phone);
        }
    }

    /** input: type */
    private _type: string;
    public get type(): string {
        return this._type;
    }
    @Input()
    public set type(v: string) {
        this._type = v;
    }

    /** cleaned version of phone numbera to be displayed */
    public phoneCleaned: string = null;

    constructor(
        private logger: DGTLoggerService,
        private paramChecker: DGTParameterCheckerService
    ) {
        this.formGroup = new FormGroup({
            phone: new FormControl(),
        });
        this.valueUpdated = new EventEmitter();
        this.submit = new EventEmitter();
    }

    ngOnInit() { }

    /**
     * On every update of the value input, update the form group values
     * @param values all values of this field
     */
    private updateReceived(value: DGTDataValue, phone: string) {
        this.logger.debug(DGTDataInterfacePhoneValueComponent.name, 'Update received', { value, phone });
        this.paramChecker.checkParametersNotNull({value, phone});

        const phoneSplit = phone.split('tel:');

        if (phoneSplit && phoneSplit.length > 0) {
            this.phoneCleaned = phoneSplit[1];
        } else {
            this.phoneCleaned = phone;
        }

        this.formGroup.setValue({
            phone: this.phoneCleaned,
        });
    }

    /**
     * @param value Value to update
     * @param string Updated phone number
     * @throws DGTErrorArgument when value is not set
     * @emits
     */
    public onValueUpdated(value: DGTDataValue, phone: string): void {
        const parsedPhone = `tel:${phone}`;
        this.paramChecker.checkParametersNotNull({value, phone});
        this.valueUpdated.emit({value, newObject: parsedPhone});
    }

    /**
     * @throws DGTErrorArgument when value is not set
     * @emits
     */
    public onSubmit(): void {
        this.submit.emit();
    }
}
