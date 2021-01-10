import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DGTLDResource } from '@digita-ai/dgt-shared-data';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';

@Component({
    selector: 'dgt-data-interface-email-value',
    templateUrl: './dgt-data-interface-email-value.component.html',
    styleUrls: ['./dgt-data-interface-email-value.component.scss'],
})
/** The Data Value component is a detailed view of a single Data Value */
export class DGTDataInterfaceEmailValueComponent implements OnInit {
    /** The form to display the data in */
    public formGroup: FormGroup;

    /** The data value of this component */
    private _resource: DGTLDResource;
    @Input()
    public get resource(): DGTLDResource {
        return this._resource;
    }
    public set resource(resource: DGTLDResource) {
        this._resource = resource;

        if (this.resource && this.email) {
            this.updateReceived(this.resource, this.email);
        }
    }

    /** Used to emit resourceUpdated events */
    @Output()
    resourceUpdated: EventEmitter<{ resource: DGTLDResource; newObject: any }>;

    /** Used to emit submit events */
    @Output()
    submit: EventEmitter<any>;

    /** input: email */
    private _email: string;
    public get email(): string {
        return this._email;
    }
    @Input()
    public set email(v: string) {
        this._email = v;

        if (this.resource && this.email) {
            this.updateReceived(this.resource, this.email);
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

    /** cleaned version of email to be displayed */
    public emailCleaned: string = null;

    constructor(private logger: DGTLoggerService, private paramChecker: DGTParameterCheckerService) {
        this.formGroup = new FormGroup({
            email: new FormControl(),
        });
        this.resourceUpdated = new EventEmitter();
        this.submit = new EventEmitter();
    }

    ngOnInit() {}

    /**
     * On every update of the value input, update the form group values
     * @param values all values of this field
     */
    private updateReceived(resource: DGTLDResource, email: string) {
        this.logger.debug(DGTDataInterfaceEmailValueComponent.name, 'Update received', { resource, email });
        this.paramChecker.checkParametersNotNull({ resource, email });

        const emailSplit = email.split('mailto:');

        if (emailSplit && emailSplit.length > 0) {
            this.emailCleaned = emailSplit[1];
        } else {
            this.emailCleaned = email;
        }

        this.formGroup.setValue({
            email: this.emailCleaned,
        });
    }

    /**
     * @param value Value to update
     * @param newObject the object value to update to
     * @param keypress keyboardevent
     * @throws DGTErrorArgument when value is not set
     * @emits
     */
    public onResourceUpdated(resource: DGTLDResource, email: string, keypress: KeyboardEvent): void {
        this.paramChecker.checkParametersNotNull({ resource, email });
        if (keypress.keyCode === 13) {
            this.submit.emit();
        } else {
            const parsedEmail = `mailto:${email}`;
            this.resourceUpdated.emit({ resource, newObject: parsedEmail });
        }
    }
}
