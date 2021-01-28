import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DGTLDResource } from '@digita-ai/dgt-shared-data';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';

@Component({
    selector: 'dgt-data-interface-phone-value',
    templateUrl: './dgt-data-interface-phone-value.component.html',
    styleUrls: ['./dgt-data-interface-phone-value.component.scss'],
})
/** The Data Value component is a detailed view of a single resource */
export class DGTDataInterfacePhoneValueComponent implements OnInit {
    /** The form to display the data in */
    public formGroup: FormGroup;

    /** The data resource of this component */
    private _resource: DGTLDResource;
    @Input()
    public get resource(): DGTLDResource {
        return this._resource;
    }
    public set resource(resource: DGTLDResource) {
        this._resource = resource;

        if (this.resource && this.phone) {
            this.updateReceived(this.resource, this.phone);
        }
    }

    /** Used to emit resourceUpdated events */
    @Output()
    resourceUpdated: EventEmitter<{ resource: DGTLDResource; newObject: any }>;

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

        if (this.resource && this.phone) {
            this.updateReceived(this.resource, this.phone);
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

    constructor(private logger: DGTLoggerService, private paramChecker: DGTParameterCheckerService) {
        this.formGroup = new FormGroup({
            phone: new FormControl(),
        });
        this.resourceUpdated = new EventEmitter();
        this.submit = new EventEmitter();
    }

    ngOnInit() {}

    /**
     * On every update of the resource input, update the form group resources
     * @param resources all resources of this field
     */
    private updateReceived(resource: DGTLDResource, phone: string) {
        this.logger.debug(DGTDataInterfacePhoneValueComponent.name, 'Update received', { resource, phone });
        this.paramChecker.checkParametersNotNull({ resource, phone });

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
     * @param resource Resource to update
     * @param string Updated phone number
     * @throws DGTErrorArgument when resource is not set
     * @emits
     */
    public onResourceUpdated(resource: DGTLDResource, phone: string): void {
        const parsedPhone = `tel:${phone}`;
        this.paramChecker.checkParametersNotNull({ resource, phone });
        this.resourceUpdated.emit({ resource, newObject: parsedPhone });
    }

    /**
     * @throws DGTErrorArgument when value is not set
     * @emits
     */
    public onSubmit(): void {
        this.submit.emit();
    }
}
