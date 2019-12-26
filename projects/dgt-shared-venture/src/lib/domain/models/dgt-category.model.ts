import { DGTI8NEntity } from '@digita/dgt-shared-web';

export interface DGTCategory extends DGTI8NEntity {
    description: string;
    icon: string;
    label: string;
    weight: number;
}
