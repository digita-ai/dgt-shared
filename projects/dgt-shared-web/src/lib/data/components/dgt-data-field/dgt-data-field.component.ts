import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DGTLDResource } from '@digita-ai/dgt-shared-data';
import { DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';

@Component({
    selector: 'dgt-data-field',
    templateUrl: './dgt-data-field.component.html',
    styleUrls: ['./dgt-data-field.component.scss'],
})
/** The Data Field component shows a text representation of a value */
export class DGTDataFieldComponent {
    public formGroup: FormGroup;

    /** The values for this field */
    private _resource: DGTLDResource;
    public get resource(): DGTLDResource {
        return this._resource;
    }
    @Input() public set resource(resource: DGTLDResource) {
        this._resource = resource;
        this.formGroup.setValue({ desc: this.resource.triples[0].object.value });
    }

    /** Used to emit resourceUpdated events */
    @Output()
    resourceUpdated: EventEmitter<{ resource: DGTLDResource; newObject: any }>;
    /** Used to emit updateValue events */
    @Output()
    submit: EventEmitter<any>;

    constructor(private paramChecker: DGTParameterCheckerService) {
        this.formGroup = new FormGroup({
            desc: new FormControl(),
        });
        this.resourceUpdated = new EventEmitter();
        this.submit = new EventEmitter();
    }

    /**
     * @param value Value to update
     * @param newObject the object value to update to
     * @param keypress keyboardevent
     * @throws DGTErrorArgument when value is not set
     * @emits
     */
    public onResourceUpdated(resource: DGTLDResource, newObject: any, keypress: KeyboardEvent): void {
        this.paramChecker.checkParametersNotNull({ resource, newObject });
        if (keypress.key === 'Enter') {
            this.submit.emit();
        } else {
            this.resourceUpdated.emit({ resource, newObject });
        }
    }
}
