import { ActionReducerMap, Action, MetaReducer } from '@ngrx/store';
import { EventsMap, EventsMapper } from 'redux-beacon';

export abstract class DGTAppRoot {
    public reducers: ActionReducerMap<any, Action>;
    public metaReducers: Array<MetaReducer<any>>;
    public events: EventsMap | EventsMapper;
    public actions: {[key: string]: string};

    // private _features: Array<DGTFeature<any>>;
    // public get features(): Array<DGTFeature<any>> {
    //     return this._features;
    // }
    // public set features(v: Array<DGTFeature<any>>) {
    //     this._features = v;

    //     if (this.features) {
    //         this.actionReducerMap = null;

    //         this.actionReducerMap = Object.assign({}, this.actionReducerMap, {
    //             app: AppReducer.getInstance().reduce,
    //             router: routerReducer
    //         });

    //         this.features.forEach((feature) => {
    //             const update = {};
    //             update[feature.name] = feature.featureReducer.reduce;

    //             this.actionReducerMap = Object.assign({}, this.actionReducerMap, update);
    //         })
    //     }
    // }

}
