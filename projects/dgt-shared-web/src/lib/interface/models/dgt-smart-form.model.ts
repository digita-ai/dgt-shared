import { FormGroup } from '@angular/forms';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTStoreService } from '../../state/services/dgt-store.service';
import { DGTSmartElement } from './dgt-smart-element.model';
import { DGTRobotVerificationResponse } from '../../validation/models/dgt-robot-verification-response.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

export abstract class DGTSmartForm<T extends DGTBaseRootState<DGTBaseAppState>> extends DGTSmartElement<T> {
    public captchaResponse: DGTRobotVerificationResponse = DGTRobotVerificationResponse.ROBOT;
    public abstract formGroup: FormGroup;

    constructor(protected store: DGTStoreService<T>) {
        super(store);
    }

    public get isValid(): boolean {
        let res = false;

        if (this.formGroup.valid
            && this.captchaResponse === DGTRobotVerificationResponse.HUMAN
        ) {
            res = true;
        }

        return res;
    }

    public onResolved(response: DGTRobotVerificationResponse) {
        this.captchaResponse = response;
    }
}
