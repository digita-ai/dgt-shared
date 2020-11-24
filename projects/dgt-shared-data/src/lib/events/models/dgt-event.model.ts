import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

/** A thing that happens or takes place on someone's pod */
export interface DGTEvent extends DGTLDResource {
    /** Description of the event e.g.: 'Connected to your pod' */
    description: string;
    /**
     * Stakeholder of the event.
     * The stakeholder is the organisation/person
     * that used your data in some way.
     * How they used it is described
     * in the description variable.
     */
    stakeholder: string;
    /**
     * The uri to the icon of the stakeholder to be displayed
     * on the timeline.
     */
    icon: string;
    /**
     * The stakeholderUri is used to give users
     * the possibility of immediately going to
     * the website of a stakeholder that accessed their data.
     */
    stakeholderUri: string;
    date: Date;
}
