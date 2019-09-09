import { DGTEmailAttachment } from './dgt-email-attachment.model';
import { DGTEmailTemplateType } from './dgt-email-template-type.model';

export class DGTEmail {
    constructor
        (
            public to: string,
            public from: string,
            public templateType: DGTEmailTemplateType,
            public attachments?: Array<DGTEmailAttachment>
        ) { }
}
