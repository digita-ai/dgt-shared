import { EventsMap, EventsMapper } from 'redux-beacon';
import { DGTAction } from './dgt-action.model';

export interface DGTFeatureDefinition<T> {
    name: string;
    reduce: (state: T, action: DGTAction) => T;
    initialState: T;
    events: EventsMap | EventsMapper;
    actionsTypes: { [key: string]: string };
}
