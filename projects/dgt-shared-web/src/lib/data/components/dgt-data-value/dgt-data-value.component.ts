import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DGTLDResource } from '@digita-ai/dgt-shared-data';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';

@Component({
    selector: 'dgt-data-value',
    templateUrl: './dgt-data-value.component.html',
    styleUrls: ['./dgt-data-value.component.scss'],
})
/** The Data Value component is a detailed view of a single Data Value */
export class DGTLDResourceComponent implements OnInit {
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
        this.updateReceived(resource);
    }

    /** Used to emit resourceUpdated events */
    @Output()
    resourceUpdated: EventEmitter<{ resource: DGTLDResource; newObject: any }>;

    constructor(private logger: DGTLoggerService, private paramChecker: DGTParameterCheckerService) {
        this.formGroup = new FormGroup({
            subject: new FormControl(),
            object: new FormControl(),
        });
        this.resourceUpdated = new EventEmitter<{ resource: DGTLDResource; newObject: any }>();
    }

    ngOnInit() {}

    /**
     * On every update of the value input, update the form group values
     * @param values all values of this field
     */
    public updateReceived(resource: DGTLDResource) {
        if (resource && resource.triples) {
            this.formGroup.setValue({
                subject: resource.triples[0].subject.value,
                object: resource.triples[0].object.value,
            });
        } else {
            this.logger.debug(DGTLDResourceComponent.name, 'resource was not set', resource);
        }
    }

    /**
     * @param resource Value to update
     * @throws DGTErrorArgument when value is not set
     * @emits
     */
    public onResourceUpdated(resource: DGTLDResource, newObject: string): void {
        this.paramChecker.checkParametersNotNull({ resource, newObject });
        this.resourceUpdated.emit({ resource, newObject });
        this.formGroup.markAsPristine();
    }
}
