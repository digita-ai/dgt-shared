import { DGTConnectionSolid, DGTEvent, DGTExchange, DGTProfile, DGTSourceSolid } from '@digita-ai/dgt-shared-data';
import { DGTAbstractAction } from '../../state/models/dgt-abstract-action.model';
import { DGTAction } from '../../state/models/dgt-action.model';

export const DGTEventsActionTypes = {
    LOAD_EVENTS: '[Timeline] Load Events',
    LOAD_EVENTS_FINISHED: '[Timeline] Load Events Finished',
    REMOVE_EVENT: '[Timeline] Remove Event',
    REMOVE_EVENT_FINISHED: '[Timeline] Remove Event Finished',
    FEEDBACK_EVENT: '[Timeline] Feedback Event',
    REGISTER_EVENT: '[Timeline] Register Event',
    REGISTER_EVENT_FINISHED: '[Timeline] Register Event Finished',
};

export interface DGTEventsLoadPayload {
    exchange: DGTExchange;
    profile: DGTProfile;
}

export class DGTEventsLoad implements DGTAbstractAction<DGTEventsLoadPayload> {
    type = DGTEventsActionTypes.LOAD_EVENTS;
    constructor(public payload: DGTEventsLoadPayload,
        public onSuccess: DGTAction[] = null,
        public onFailure: DGTAction[] = null) { }
}

export interface DGTEventsLoadFinishedPayload {
    events: DGTEvent[];
    exchange: DGTExchange;
}

export class DGTEventsLoadFinished implements DGTAbstractAction<DGTEventsLoadFinishedPayload> {
    type = DGTEventsActionTypes.LOAD_EVENTS_FINISHED;
    constructor(public payload: DGTEventsLoadFinishedPayload,
        public onSuccess: DGTAction[] = null,
        public onFailure: DGTAction[] = null) { }
}

export interface DGTEventsRemovePayload {
    exchange: DGTExchange;
    events: DGTEvent[]
}

export class DGTEventsRemove implements DGTAbstractAction<DGTEventsRemovePayload> {
    type = DGTEventsActionTypes.REMOVE_EVENT;
    constructor(public payload: DGTEventsRemovePayload,
        public onSuccess: DGTAction[] = null,
        public onFailure: DGTAction[] = null) { }
}

export interface DGTEventsRemoveFinishedPayload {
    events: DGTEvent[];
}

export class DGTEventsRemoveFinished implements DGTAbstractAction<DGTEventsRemoveFinishedPayload> {
    type = DGTEventsActionTypes.REMOVE_EVENT_FINISHED;
    constructor(public payload: DGTEventsRemoveFinishedPayload,
        public onSuccess: DGTAction[] = null,
        public onFailure: DGTAction[] = null) { }
}

export interface DGTEventsFeedbackPayload {
    event: DGTEvent;
}

export class DGTEventsFeedback implements DGTAbstractAction<DGTEventsFeedbackPayload> {
    type = DGTEventsActionTypes.FEEDBACK_EVENT;
    constructor(public payload: DGTEventsFeedbackPayload,
        public onSuccess: DGTAction[] = null,
        public onFailure: DGTAction[] = null) { }
}

export interface DGTEventsRegisterPayload {
    event: DGTEvent;
    profile: DGTProfile;
}
export class DGTEventsRegister implements DGTAbstractAction<DGTEventsRegisterPayload> {
    type = DGTEventsActionTypes.REGISTER_EVENT;

    constructor(public payload: DGTEventsRegisterPayload,
        public onSuccess: DGTAction[] = null,
        public onFailure: DGTAction[] = null) { }
}

export interface DGTEventsRegisterFinishedPayload {
    event: DGTEvent;
}
export class DGTEventsRegisterFinished implements DGTAbstractAction<DGTEventsRegisterFinishedPayload> {
    type = DGTEventsActionTypes.REGISTER_EVENT_FINISHED;

    constructor(public payload: DGTEventsRegisterFinishedPayload,
        public onSuccess: DGTAction[] = null,
        public onFailure: DGTAction[] = null) { }
}
