import { async, TestBed } from '@angular/core/testing';
import { Type } from '@angular/core';

import { DGTTestRunner } from './dgt-test-runner.service';
import { DGTTestConfiguration } from '../../configuration/models/dgt-test-configuration.model';

export class DGTTestRunnerService<T> extends DGTTestRunner {
    public service: T;

    constructor(configuration: DGTTestConfiguration) {
        super(configuration);
    }

    public setup(serviceType: Type<T>) {
        beforeAll(() => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
        });

        beforeEach(async(() => {
            TestBed.configureTestingModule(this.configuration.module)
                .compileComponents();
        }));

        beforeEach(() => {
            this.service = TestBed.get(serviceType);
        });
    }
}
