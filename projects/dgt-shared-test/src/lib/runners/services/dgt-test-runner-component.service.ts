import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Type } from '@angular/core';
import { DGTTestRunner } from './dgt-test-runner.service';
import { DGTTestConfiguration } from '../../configuration/models/dgt-test-configuration.model';

export class DGTTestRunnerComponent<T> extends DGTTestRunner {
    public component: T;
    public fixture: ComponentFixture<T>;

    constructor(configuration: DGTTestConfiguration) {
        super(configuration);
    }

    public setup(componentType: Type<T>, detectChanges: boolean = true) {
        beforeAll(() => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
        });

        beforeEach(async(() => {
            TestBed.configureTestingModule(this.configuration.module)
                .compileComponents();
        }));

        beforeEach(() => {
            this.fixture = TestBed.createComponent<T>(componentType);
            this.component = this.fixture.componentInstance;

            if (detectChanges) {
                this.fixture.detectChanges();
            }
        });
    }
}
